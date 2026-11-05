export type OfferInputs = {
  listCents: number
  costCents: number
  targetCents: number
  feeBasisPoints: number
  oneOfOne: boolean
}

export function offerThresholds(input: OfferInputs) {
  const { listCents, costCents, targetCents, feeBasisPoints, oneOfOne } = input
  if (![listCents, costCents, targetCents, feeBasisPoints].every((x) => Number.isSafeInteger(x) && x >= 0) ||
      listCents === 0 || listCents > 100_000_000 || costCents > 100_000_000 || targetCents > 100_000_000 ||
      feeBasisPoints >= 10_000) return null
  // Round up to the next cent. Fees apply to the proposed merchandise price.
  const marginFloor = Math.ceil(((costCents + targetCents) * 10_000) / (10_000 - feeBasisPoints))
  const reviewFloor = Math.max(Math.ceil((listCents * 75) / 100), marginFloor)
  const acceptFloor = Math.max(Math.ceil((listCents * 90) / 100), marginFloor)
  return {
    marginFloor,
    reviewFloor,
    acceptFloor,
    autoFloor: oneOfOne || acceptFloor >= listCents ? null : acceptFloor,
  }
}

export function offerDecision(input: OfferInputs, offerCents: number) {
  const thresholds = offerThresholds(input)
  if (!thresholds || !Number.isSafeInteger(offerCents) || offerCents < 0) return 'missing-input'
  if (offerCents < thresholds.reviewFloor) return 'decline'
  if (input.oneOfOne || offerCents < thresholds.acceptFloor) return 'review'
  if (thresholds.autoFloor === null) return 'review'
  return 'auto-accept-candidate'
}

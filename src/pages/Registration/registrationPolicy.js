const PROFILE_POLICY_RULES = {
  min_chanting_rounds: {
    label: "chanting rounds",
    getCurrentValue: (profileData) =>
      profileData?.no_of_chanting_rounds ?? profileData?.roundsChanting,
  },
};

export function getRegistrationPolicyStatus(policy, profileData) {
  const unmetRequirements = Object.entries(PROFILE_POLICY_RULES)
    .map(([policyKey, rule]) => {
      const requiredValue = Number(policy?.[policyKey] || 0);
      const currentValue = Number(rule.getCurrentValue(profileData) || 0);

      return {
        policyKey,
        label: rule.label,
        requiredValue,
        currentValue,
        unmet: requiredValue > currentValue,
      };
    })
    .filter((requirement) => requirement.unmet);

  const primaryRequirement = unmetRequirements[0] || null;

  return {
    blocked: unmetRequirements.length > 0,
    unmetRequirements,
    primaryRequirement,
  };
}

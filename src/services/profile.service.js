const { UserProfile } = require('../models/userProfile');
const { validate, userProfileSchema } = require('../lib/validation');

/**
 * Upsert user profile data for a given conference.
 * Used by onboarding flow to persist validated profile info.
 */
async function upsertProfileForConference({ telegramId, conferenceId, data }) {
  if (!telegramId || !conferenceId) {
    throw new Error('MISSING_KEYS');
  }

  // Validate only known fields via Joi
  const validated = validate(data, userProfileSchema);

  let profile = await UserProfile.findOne({
    telegramId,
    conference: conferenceId,
  });

  if (!profile) {
    profile = new UserProfile({
      telegramId,
      conference: conferenceId,
      isActive: true,
    });
  }

  Object.assign(profile, validated);
  profile.onboardingCompleted = true;

  await profile.save();

  return profile;
}

module.exports = {
  upsertProfileForConference,
};



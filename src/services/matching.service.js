const { Conference } = require('../models/conference');
const { UserProfile } = require('../models/userProfile');

/**
 * Basic profile search / matching inside a conference.
 * Supports filters:
 * - role: 'speaker' | 'investor' | 'participant' | 'organizer'
 * - text: free-text match against interests / offerings / lookingFor
 */
async function searchProfiles({ conferenceCode, role, text, limit = 20 }) {
  const conference = await Conference.findOne({ conferenceCode });
  if (!conference) {
    throw new Error('CONFERENCE_NOT_FOUND');
  }

  const query = {
    conference: conference._id,
    isActive: true,
    onboardingCompleted: true,
  };

  if (role) {
    query.roles = role;
  }

  const profiles = await UserProfile.find(query).limit(limit);

  if (text && text.trim()) {
    const t = text.trim().toLowerCase();
    const filtered = profiles.filter((p) => {
      const fields = []
        .concat(p.interests || [])
        .concat(p.offerings || [])
        .concat(p.lookingFor || []);
      return fields.some((val) => String(val).toLowerCase().includes(t));
    });
    return { conference, profiles: filtered };
  }

  return { conference, profiles };
}

module.exports = {
  searchProfiles,
};



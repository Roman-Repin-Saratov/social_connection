const { Conference } = require('../models/conference');
const { UserProfile } = require('../models/userProfile');
const { userIsMainAdmin } = require('./conference.service');
const { emitToConference } = require('../lib/realtime');

async function assertConferenceAdmin({ user, conference }) {
  if (userIsMainAdmin(user)) return;

  const profiles = await UserProfile.find({
    telegramId: user.telegramId,
    conference: conference._id,
  });
  const profileIdsStr = profiles.map((p) => p._id.toString());
  const isConferenceAdmin =
    profileIdsStr.length > 0 &&
    conference.admins.some((id) => profileIdsStr.includes(id.toString()));

  if (!isConferenceAdmin) {
    const err = new Error('ACCESS_DENIED');
    throw err;
  }
}

async function setSlide({ moderatorUser, conferenceCode, url, title }) {
  const { validate, slideSchema } = require('../lib/validation');
  
  // Validate input data
  const validated = validate({ url, title: title || '', conferenceCode }, slideSchema);
  const validatedUrl = validated.url;
  const validatedTitle = validated.title;
  const validatedCode = validated.conferenceCode;

  const conference = await Conference.findOne({ conferenceCode: validatedCode });
  if (!conference) {
    const err = new Error('CONFERENCE_NOT_FOUND');
    throw err;
  }

  await assertConferenceAdmin({ user: moderatorUser, conference });

  conference.currentSlideUrl = validatedUrl;
  conference.currentSlideTitle = validatedTitle || '';
  await conference.save();

  emitToConference(conference._id, 'slide-updated', {
    url: conference.currentSlideUrl,
    title: conference.currentSlideTitle,
  });

  return conference;
}

async function clearSlide({ moderatorUser, conferenceCode }) {
  const conference = await Conference.findOne({ conferenceCode });
  if (!conference) {
    const err = new Error('CONFERENCE_NOT_FOUND');
    throw err;
  }

  await assertConferenceAdmin({ user: moderatorUser, conference });

  conference.currentSlideUrl = undefined;
  conference.currentSlideTitle = undefined;
  await conference.save();

  emitToConference(conference._id, 'slide-updated', {
    url: null,
    title: null,
  });

  return conference;
}

module.exports = {
  setSlide,
  clearSlide,
};



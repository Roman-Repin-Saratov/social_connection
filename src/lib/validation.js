const Joi = require('joi');

// Validation schemas per P1.2 requirements

// User profile validation
const MAX_NAME_LENGTH = 100;
const MAX_INTERESTS_COUNT = 20;
const MAX_INTEREST_LENGTH = 50;
const MAX_OFFERING_LENGTH = 200;
const MAX_LOOKING_FOR_LENGTH = 200;

const nameSchema = Joi.string()
  .trim()
  .min(1)
  .max(MAX_NAME_LENGTH)
  .pattern(/^[a-zA-Zа-яА-ЯёЁ\s\-'\.]+$/)
  .messages({
    'string.pattern.base': 'Имя может содержать только буквы, пробелы, дефисы, апострофы и точки',
    'string.min': 'Имя не может быть пустым',
    'string.max': `Имя не может быть длиннее ${MAX_NAME_LENGTH} символов`,
  });

const interestsSchema = Joi.array()
  .items(
    Joi.string()
      .trim()
      .min(1)
      .max(MAX_INTEREST_LENGTH)
      .pattern(/^[a-zA-Zа-яА-ЯёЁ0-9\s\-_,\.]+$/)
  )
  .max(MAX_INTERESTS_COUNT)
  .messages({
    'array.max': `Максимум ${MAX_INTERESTS_COUNT} интересов`,
    'string.pattern.base': 'Интерес содержит недопустимые символы',
  });

const offeringsSchema = Joi.array()
  .items(Joi.string().trim().min(1).max(MAX_OFFERING_LENGTH))
  .max(MAX_INTERESTS_COUNT)
  .messages({
    'array.max': `Максимум ${MAX_INTERESTS_COUNT} предложений`,
    'string.max': `Каждое предложение не может быть длиннее ${MAX_OFFERING_LENGTH} символов`,
  });

const lookingForSchema = Joi.array()
  .items(Joi.string().trim().min(1).max(MAX_LOOKING_FOR_LENGTH))
  .max(MAX_INTERESTS_COUNT)
  .messages({
    'array.max': `Максимум ${MAX_INTERESTS_COUNT} пунктов`,
    'string.max': `Каждый пункт не может быть длиннее ${MAX_LOOKING_FOR_LENGTH} символов`,
  });

const userProfileSchema = Joi.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.allow('').optional(), // Allow empty string for lastName
  interests: interestsSchema.optional(),
  offerings: offeringsSchema.optional(),
  lookingFor: lookingForSchema.optional(),
  roles: Joi.array()
    .items(Joi.string().valid('speaker', 'investor', 'participant', 'organizer'))
    .optional(),
});

// Question validation
const MAX_QUESTION_LENGTH = 500;
const MIN_QUESTION_LENGTH = 10;

const questionTextSchema = Joi.string()
  .trim()
  .min(MIN_QUESTION_LENGTH)
  .max(MAX_QUESTION_LENGTH)
  .pattern(/^[^\x00-\x08\x0B-\x0C\x0E-\x1F]+$/) // No control chars except \n, \r, \t
  .messages({
    'string.min': `Вопрос должен содержать минимум ${MIN_QUESTION_LENGTH} символов`,
    'string.max': `Вопрос не может быть длиннее ${MAX_QUESTION_LENGTH} символов`,
    'string.pattern.base': 'Вопрос содержит недопустимые символы',
  });

const questionSchema = Joi.object({
  text: questionTextSchema.required(),
  conferenceCode: Joi.string().trim().min(1).required(),
});

// Poll validation
const MAX_POLL_QUESTION_LENGTH = 200;
const MAX_OPTIONS_COUNT = 10;
const MIN_OPTIONS_COUNT = 2;
const MAX_OPTION_TEXT_LENGTH = 100;

const pollQuestionSchema = Joi.string()
  .trim()
  .min(5)
  .max(MAX_POLL_QUESTION_LENGTH)
  .required()
  .messages({
    'string.min': 'Вопрос опроса должен содержать минимум 5 символов',
    'string.max': `Вопрос опроса не может быть длиннее ${MAX_POLL_QUESTION_LENGTH} символов`,
  });

const pollOptionSchema = Joi.object({
  id: Joi.number().integer().min(0).optional(), // ID is auto-generated in service, optional for input
  text: Joi.string()
    .trim()
    .min(1)
    .max(MAX_OPTION_TEXT_LENGTH)
    .required()
    .messages({
      'string.max': `Вариант ответа не может быть длиннее ${MAX_OPTION_TEXT_LENGTH} символов`,
    }),
});

const pollSchema = Joi.object({
  question: pollQuestionSchema.required(),
  options: Joi.array()
    .items(pollOptionSchema)
    .min(MIN_OPTIONS_COUNT)
    .max(MAX_OPTIONS_COUNT)
    .required()
    .messages({
      'array.min': `Опрос должен содержать минимум ${MIN_OPTIONS_COUNT} варианта ответа`,
      'array.max': `Опрос не может содержать более ${MAX_OPTIONS_COUNT} вариантов ответа`,
    }),
  conferenceCode: Joi.string().trim().min(1).required(),
});

// Conference validation
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;

const conferenceSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(MAX_TITLE_LENGTH)
    .required()
    .messages({
      'string.min': 'Название конференции должно содержать минимум 3 символа',
      'string.max': `Название конференции не может быть длиннее ${MAX_TITLE_LENGTH} символов`,
    }),
  description: Joi.string().trim().max(MAX_DESCRIPTION_LENGTH).optional().allow(''),
  access: Joi.string().valid('public', 'private').optional(),
  startsAt: Joi.date().optional(),
  endsAt: Joi.date().greater(Joi.ref('startsAt')).optional().messages({
    'date.greater': 'Дата окончания должна быть позже даты начала',
  }),
});

// Slide validation
const MAX_SLIDE_TITLE_LENGTH = 200;
const slideUrlSchema = Joi.string()
  .uri({ scheme: ['http', 'https'] })
  .max(2048)
  .required()
  .messages({
    'string.uri': 'URL слайда должен быть валидным HTTP/HTTPS адресом',
    'string.max': 'URL слайда не может быть длиннее 2048 символов',
  });

const slideSchema = Joi.object({
  url: slideUrlSchema.required(),
  title: Joi.string().trim().max(MAX_SLIDE_TITLE_LENGTH).optional().allow(''),
  conferenceCode: Joi.string().trim().min(1).required(),
});

// Validation helper functions
function validate(data, schema) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message).join('; ');
    const validationError = new Error(`VALIDATION_ERROR: ${messages}`);
    validationError.details = error.details;
    throw validationError;
  }

  return value;
}

module.exports = {
  validate,
  userProfileSchema,
  questionSchema,
  pollSchema,
  conferenceSchema,
  slideSchema,
  // Export individual schemas for reuse
  nameSchema,
  interestsSchema,
  questionTextSchema,
  pollQuestionSchema,
  pollOptionSchema,
};


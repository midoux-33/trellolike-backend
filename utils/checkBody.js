function checkBody(body, keys) {
  const missingFields = [];
  let isValid = true;

  for (const field of keys) {
    if (!body[field] || body[field] === '') {
      isValid = false;
      missingFields.push(field);
    }
  }

  return {
    isValid,
    missingFields,
    message: isValid ? 'tou les champs sont remplis.' : `les champs manquants sont: ${missingFields.join(', ')}`
  };
}

module.exports = { checkBody };

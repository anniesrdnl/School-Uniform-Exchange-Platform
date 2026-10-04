export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// Postgres error codes returned by Supabase -> HTTP status + readable message
const PG_ERRORS = {
  '23505': [409, (e) => (/student_id/.test(e.message + e.details) ? 'That student ID is already registered.' : 'That record already exists.')],
  '23502': [400, (e) => `Missing required field${/column "(\w+)"/.test(e.message) ? `: ${e.message.match(/column "(\w+)"/)[1]}` : ''}.`],
  '23514': [400, () => 'Some of the values are not allowed. Please check the form.'],
  '23503': [400, () => 'A referenced record does not exist.'],
  '22P02': [400, () => 'Invalid ID or value.'],
};

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  let status = err.status || 500;
  let message = err.message || 'Something went wrong.';

  const pg = PG_ERRORS[err.code];
  if (pg) {
    status = pg[0];
    message = pg[1](err);
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'Each photo must be 5 MB or smaller.';
  }
  res.status(status).json({ message });
}

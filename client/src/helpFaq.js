// Questions and answers for the help assistant (components/HelpChat.jsx). The assistant only knows what is here,
// so keep answers in sync with how the app actually works, and say so plainly when a feature doesn't exist yet.
//
// keywords: lowercase words or phrases that point to an answer. Tagalog/Taglish words are included because
// many students type that way. Phrases (two or more words) count double because they are more specific.

export const FAQ = [
  {
    id: 'buy',
    question: 'How do I buy a uniform?',
    keywords: ['buy', 'purchase', 'order', 'get a uniform', 'request', 'send a request', 'request to buy', 'bili', 'bumili', 'pabili'],
    answer: 'Open Browse and pick a uniform. On its page, add a note if you like and tap "Request to buy". When the seller accepts, the uniform is reserved for you. Agree on where to meet, pay the seller in person, and they mark the exchange as completed.',
    link: { to: '/browse', label: 'Browse uniforms' },
  },
  {
    id: 'sell',
    question: 'How do I sell a uniform?',
    keywords: ['sell', 'selling', 'post', 'list', 'listing', 'post a uniform', 'become a seller', 'benta', 'magbenta', 'ibenta', 'binebenta'],
    answer: "Log in and tap Sell. Add up to 5 photos (the first one is the cover), then the title, category, size, condition, price and quantity, and choose whether you're open to selling, swapping, or both. Your listing shows up in Browse right away.",
    link: { to: '/sell', label: 'Post a uniform' },
  },
  {
    id: 'swap',
    question: 'How does swapping work?',
    keywords: ['swap', 'swapping', 'exchange', 'trade', 'barter', 'palit', 'ipalit', 'magpalit'],
    answer: 'Listings marked "Exchange Only" or "Buy or Exchange" accept swaps. On the listing page, choose Exchange under "I want to", describe what you can offer in the note, and tap "Request swap". Use "Message seller" to agree on the details.',
    link: { to: '/browse', label: 'Find swappable uniforms' },
  },
  {
    id: 'pay',
    question: 'How do I pay? Is it free?',
    keywords: ['pay', 'payment', 'paid', 'gcash', 'cash', 'fee', 'fees', 'free', 'cost', 'charge', 'price', 'bayad', 'magbayad', 'magkano', 'libre'],
    answer: "Joining and posting are free, and the platform doesn't take a cut. There's no online checkout: you pay the seller directly when you meet, in cash or however you both agree (for example GCash). Only pay after you've checked the uniform.",
  },
  {
    id: 'contact',
    question: 'How do I contact a seller?',
    keywords: ['message', 'chat', 'contact', 'talk', 'reply', 'inbox', 'message the seller', 'contact the seller', 'usap', 'kausap', 'mag message'],
    answer: 'Open the listing and tap "Message seller". The conversation appears in Messages, where you can send text and photos. You need to be logged in.',
    link: { to: '/messages', label: 'Open Messages' },
  },
  {
    id: 'status',
    question: 'What do the request statuses mean?',
    keywords: ['status', 'request', 'pending', 'accepted', 'declined', 'cancelled', 'canceled', 'completed', 'reserved', 'sold'],
    answer: 'Pending: waiting for the seller to respond.\nAccepted: the seller agreed and the uniform is reserved for you.\nDeclined: the seller said no.\nCancelled: the buyer withdrew the request.\nCompleted: the exchange happened and the uniform is sold.',
    link: { to: '/profile', label: 'See my requests' },
  },
  {
    id: 'cancel',
    question: 'How do I cancel a request?',
    keywords: ['cancel', 'withdraw', 'undo', 'change my mind', 'ayaw ko na', 'icancel'],
    answer: 'Go to Profile, find the request under "My requests" and tap Cancel. You can cancel while a request is pending or accepted. If it was already accepted, the uniform becomes available again.',
    link: { to: '/profile', label: 'Go to my profile' },
  },
  {
    id: 'manage',
    question: 'How do I edit or delete my listing?',
    keywords: ['edit', 'delete', 'remove', 'update', 'change', 'change price', 'change the price', 'edit price', 'my listing', 'my listings', 'mark as sold', 'burahin', 'tanggalin'],
    answer: 'Go to Profile and tap Delete next to the listing under "My listings". Editing isn\'t available yet, so to change the details, delete the listing and post it again (best done before anyone has requested it). You don\'t need to mark items sold yourself: a listing becomes reserved when you accept a request and sold when you mark it completed.',
    link: { to: '/profile', label: 'Go to my listings' },
  },
  {
    id: 'verify',
    question: 'How do I get verified?',
    keywords: ['verified', 'verification', 'verify my account', 'badge', 'awaiting verification', 'student id'],
    answer: 'An admin reviews new accounts and marks verified students. Your profile shows "Awaiting verification" until then, and a "Verified student" badge after. There\'s nothing you need to submit.',
  },
  {
    id: 'condition',
    question: 'What do the conditions mean?',
    keywords: ['condition', 'conditions', 'like new', 'fair', 'quality', 'worn', 'wear', 'damage', 'damaged', 'stain', 'used'],
    answer: 'New: never worn.\nLike New: worn a few times, no visible wear.\nGood: normal wear, no damage.\nFair: visible wear such as fading or small marks.\nAlways check the photos and description, and ask the seller if you\'re unsure.',
  },
  {
    id: 'size',
    question: 'How do I find the right size?',
    keywords: ['size', 'sizes', 'sizing', 'fit', 'fits', 'small', 'medium', 'large', 'xs', 'xl', 'xxl', 'measurement', 'measurements', 'sukat'],
    answer: 'Use the Size filter in Browse. Sizes are entered by the seller and fit varies between makers, so check the description or message the seller for measurements before you send a request.',
    link: { to: '/browse', label: 'Browse by size' },
  },
  {
    id: 'safety',
    question: 'Tips for a safe exchange',
    keywords: ['safe', 'safety', 'scam', 'scammer', 'meet', 'meetup', 'meet up', 'where to meet', 'trust', 'fake', 'legit'],
    answer: "Meet on campus in a busy place during school hours. Check the uniform before you pay, keep your conversation in the app, and never share your password. You can see each seller's rating on their listings.",
  },
  {
    id: 'review',
    question: 'How do reviews work?',
    keywords: ['review', 'rating', 'rate', 'stars', 'feedback', 'rate the seller', 'leave a review'],
    answer: 'After an exchange is marked completed, the buyer and the seller can each leave a 1 to 5 star rating from their Profile. A seller\'s rating shows on every listing they post.',
    link: { to: '/profile', label: 'Go to my profile' },
  },
  {
    id: 'signup',
    question: 'How do I create an account?',
    keywords: ['sign up', 'signup', 'register', 'registration', 'create account', 'create an account', 'join', 'new account', 'magregister'],
    answer: 'Tap Sign up and enter your full name, student ID, email, program, year level, and a password of at least 6 characters. You may need to confirm your email using the link we send before you can log in.',
    link: { to: '/register', label: 'Create an account' },
  },
  {
    id: 'login',
    question: "I can't log in",
    keywords: ['login', 'log in', 'sign in', 'cant log in', 'cannot log in', 'password', 'forgot', 'reset', 'locked', 'confirm email', 'confirmation'],
    answer: "Check your email and password (the eye icon shows what you typed). If you just signed up, confirm your email first using the link we sent. Password reset isn't available in the app yet, so contact your school's platform admin if you're locked out.",
    link: { to: '/login', label: 'Go to log in' },
  },
  {
    id: 'photos',
    question: 'Why won\'t my photos upload?',
    keywords: ['photo', 'photos', 'picture', 'pictures', 'image', 'images', 'upload', 'pic', 'pics', 'litrato'],
    answer: 'You can add up to 5 photos per listing, and they must be image files. Large photos are resized automatically before upload, but each one must still be under 5 MB. Good light and a plain background help your listing stand out.',
  },
];

export const FAQ_BY_ID = Object.fromEntries(FAQ.map((f) => [f.id, f]));
export const START_SUGGESTIONS = ['buy', 'sell', 'swap', 'pay'];

// Lowercase, strip punctuation ("can't" -> "cant"), single spaces, padded so phrases match on word boundaries
const normalize = (s) => ` ${s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9ñ]+/g, ' ').trim()} `;
const KEYWORDS = FAQ.map((f) => ({ f, keys: f.keywords.map((k) => normalize(k).trim()) }));

// FAQs ranked by how many of their keywords appear in the text (plural "s" also matches)
export function findMatches(text) {
  const q = normalize(text);
  return KEYWORDS
    .map(({ f, keys }) => ({
      f,
      score: keys.reduce((n, k) => n + (q.includes(` ${k} `) || q.includes(` ${k}s `) ? (k.includes(' ') ? 2 : 1) : 0), 0),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.f);
}

// Up to 3 follow-up topics: related matches first, then the starter topics
const suggestionsAfter = (shownId, related = []) =>
  [...new Set([...related.map((f) => f.id), ...START_SUGGESTIONS])].filter((id) => id !== shownId).slice(0, 3);

export const answerFor = (id, related = []) => {
  const f = FAQ_BY_ID[id];
  return { text: f.answer, link: f.link, suggestions: suggestionsAfter(id, related) };
};

const GREETING = /^\s*(hi|hello|hey|hiya|yo|good (morning|afternoon|evening)|kumusta|kamusta|musta)\b/i;
const THANKS = /\b(thanks|thank you|thx|ty|salamat)\b/i;

// The assistant's reply to free text: { text, link?, suggestions }
export function reply(text) {
  const [best, ...related] = findMatches(text);
  if (best) return answerFor(best.id, related);
  if (THANKS.test(text)) return { text: "You're welcome! Anything else I can help with?", suggestions: START_SUGGESTIONS };
  if (GREETING.test(text)) return { text: 'Hi! Ask me anything about buying, selling or swapping uniforms.', suggestions: START_SUGGESTIONS };
  return {
    text: "Sorry, I don't have an answer for that yet. Try one of these topics, or message the seller directly from a listing.",
    suggestions: START_SUGGESTIONS,
  };
}

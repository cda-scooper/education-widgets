(function() {
  const quotes = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela' },
    { text: 'The purpose of education is to replace an empty mind with an open one.', author: 'Malcolm Forbes' },
    { text: 'Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.', author: 'Albert Schweitzer' },
    { text: 'The beautiful thing about learning is that no one can take it away from you.', author: 'B.B. King' },
    { text: 'The mind is not a vessel to be filled, but a fire to be kindled.', author: 'Plutarch' },
    { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
    { text: 'The roots of education are bitter, but the fruit is sweet.', author: 'Aristotle' },
    { text: 'Education is not preparation for life; education is life itself.', author: 'John Dewey' },
    { text: 'The more that you read, the more things you will know. The more that you learn, the more places youll go.', author: 'Dr. Seuss' }
  ];

  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const quote = quotes[dayOfYear % quotes.length];

  const quoteWidget = document.getElementById('quote-widget');
  if (quoteWidget) {
    quoteWidget.innerHTML = `
      <blockquote style="font-family: 'Georgia', serif; margin: 20px; padding: 10px; border-left: 5px solid #ccc;">
        <p style="font-size: 1.2em;">"${quote.text}"</p>
        <footer style="font-style: italic; text-align: right;">- ${quote.author}</footer>
      </blockquote>
    `;
  }

  // Extract ?embed=... from URL, then fallback to data-widget-id, then hostname
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmbedId = urlParams.get('embed');
  const widgetId = urlEmbedId || document.body.getAttribute('data-widget-id') || window.location.hostname;
  const DATA_KEY = `dailyQuoteData-${widgetId}`;
  const THEME_KEY = `dailyQuoteTheme-${widgetId}`;
})(); 
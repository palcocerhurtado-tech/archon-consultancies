# Visitor journey interaction checks

`npm test` runs the dependency-free regression suite, including route guards,
progress bounds and native form fallback checks.

The optional DOM check exercises the actual four HTML forms and existing contact
delivery handler. It covers validation, Enter, editing, duplicate submission,
recoverable delivery failure, language changes, query prefilling and mobile menu
keyboard behaviour. All delivery requests are mocked; it sends no real enquiry.

With jsdom installed in a development environment:

```sh
node tests/journey-dom.mjs
```

Alternatively pass the absolute path to an external jsdom `lib/api.js` module.
This avoids adding a browser or testing dependency to the website's runtime.

These checks do not verify actual browser layout or screen-reader behaviour.
Review the Vercel preview at desktop and mobile widths before production.

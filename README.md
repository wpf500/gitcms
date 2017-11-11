# GitCMS

A Git-based, JSON schema powered CMS

Repositories must have a `.gitcms.json` file in their route with the following structure:

```
{
  "pages": [
    {
      "id": "en",
      "name": "English",
      "file": "locale/en.json"
    },
    {
      "id": "ar",
      "name": "Arabic",
      "file": "locale/ar.json"
    }
  ],
  "schema": {},
  "uiSchema": {}
}
```

See https://github.com/mozilla-services/react-jsonschema-form for details on `schema` and `uiSchema`

### To run

Your verison of Node must support async/await (>7?)

```
npm install
node .
```

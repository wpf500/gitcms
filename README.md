# GitCMS

A Git-based, JSON schema powered CMS

## To run

Copy `config.example.json` to `config.json` and fill it in. The `upload` settings
are only needed if you want to support image uploading. `auth` will be used for
the Basic Auth challenge.

```
npm install
npm run build
node .
```

## How it works

Repositories must have a `.gitcms.yml` file in their root with the following
structure:

```yaml
version: 2
pages:
  - id: "en",
    name: "English",
    file: "locale/en.json"
    schema: &schema
      ...
    uiSchema: &uiSchema
      ...

  - id: "ar",
    name: "Arabic",
    file: "locale/ar.json"
    schema: *schema
    uiSchema: *uiSchema
```

See https://github.com/mozilla-services/react-jsonschema-form for details on
`schema` and `uiSchema`. `uiSchema` is optional.

`.gitcms.json` is also supported but not recommended as YAML anchors are
very useful for deduplicating schema definitions.

### Previous versions

If no version number is given it is assumed to be version 1, which only
supports having the same `schema`/`uiSchema` definition for all pages.
```yaml
version: 1
pages:
  - id: "en"
    name: "English"
    file: "locale/en.json"

  - id: "ar"
    name: "Arabic"
    file: "locale/ar.json"

schema:
  ...
uiSchema:
  ...
```

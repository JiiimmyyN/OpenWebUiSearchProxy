# Open WebUI Search Proxy

The built in Brave search configuration in Open WebUI doesn't allow limiting the language of the search result
ofthen this results in the AI model to start speaking gibberish in some random language, depending on the language of the search result.

Currently this search proxy sets both the `search_lang=en` and `ui_lang=en-US` for the brave API in hopes we'll only get english results.

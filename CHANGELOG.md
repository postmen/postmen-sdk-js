# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
 
## [2.0.0] - 2023-03-09
### Breaking Changes
- Legacy API key is now deprecated and cannot be used for authentication. Please use this [guide](https://www.aftership.com/docs/shipping/quickstart/api-quick-start#2-get-the-api-key) to obtain a modern API key for making requests with this version. 
 
**This update does not require any changes to your code base. However the legacy Postmen API key cannot be used anymore.**

You can check which version of API keys you are using by looking at the header key used for authentication:

Type | API Header Key
--- | ---
Legacy API Key | `postmen-api-key`
Modern API Key | `as-api-key`

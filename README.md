# LamdaHandler

_LambdaHandler_ is a library designed to make it easy to write AWS Lambda function in typescript. It tries to abstract the more mondane logic related to implementing a AWS Lambda function.

The library caters primarely to handling AWS API Gateaway request using the _Lambda Proxy integration_.

The _LambdaHandler_ library is designed to write reusable object oriented code for Lambda.

## Key features
* Abstract the AWS API Gateway Event and AWS Lambda Proxy Callback via `Request` and `Response` objects.
* Provide classes for standard HTTP errors.
* Provide a handlers for typical task like accessing a Dynamo table via a RESTFull API, Queing requests in an SQS Queue or Proxying a request to a different server.


## Installation
```bash
npm install --save lambda-handler
```

## Show me some examples

### Hello World
```typescript
import * as LambdaHandler from 'lambda-handler';

class DivisionHandler extends LambdaHandler.Handlers.AbstractHandler {

    public process(request:LambdaHandler.Request, response:LambdaHandler.Response): Promise<void> {
        response.setBody('hello world').addHeader('content-type', 'text/plain').send();
        return Promise.resolve();
    }

}

const handlerObj = new DivisionHandler();
export let handler = handlerObj.handle;

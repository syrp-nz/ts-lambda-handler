import { APIGatewayEvent } from 'aws-lambda';
import * as Lib from '../index';

export const fakeEvent: APIGatewayEvent = {
    "resource":"/test/endpoint",
    "path":"/test/endpoint",
    "httpMethod":"POST",
    "headers":{
        "accept":"*/*",
        "accept-encoding":"gzip;q=1.0,deflate;q=0.6,identity;q=0.3",
        "cloudfront-forwarded-proto":"https",
        "cloudfront-is-desktop-viewer":"true",
        "cloudfront-is-mobile-viewer":"false",
        "cloudfront-is-smarttv-viewer":"false",
        "cloudfront-is-tablet-viewer":"false",
        "cloudfront-viewer-country":"CA",
        "content-type":"application/json",
        "host":"jwvlc9hgjg.execute-api.us-west-2.amazonaws.com",
        "user-agent":"Ruby",
        "via":"1.1 f667ea16977a9663d0c408cc2c90a756.cloudfront.net (CloudFront)",
        "x-amz-cf-id":"nfTqqN-SViUEUexpWhxO3yDiwDBclNjuSKA0Qx4Jdm36OcJB3q-Gng==",
        "x-amzn-trace-id":"Root=1-58b4d76c-54eead2a5c0f7b375ad5857a",
        "x-forwarded-for":"23.227.37.117, 52.46.12.116",
        "x-forwarded-port":"443",
        "x-forwarded-proto":"https",
        "x-newrelic-id":"VQQUUFNS",
        "x-newrelic-transaction":"PxQAUQBbAFEEB1AHUgACBFIDFB8EBw8RVU4aVQheDApRUVpQVAQCVwYABUNKQQkCAQFUVlYBFTs=",
        "x-shopify-hmac-sha256":"+7YE/TtOV1flUT2aV5el4QW4EI/sXn3nn1dDqrVmZP4=",
        "x-shopify-order-id":"4870274641",
        "x-shopify-shop-domain":"syrpnz.myshopify.com",
        "x-shopify-test":"false",
        "x-shopify-topic":"orders/create",
        "origin":"https://example.com",
        "UPPER": "CASE",
        "lower": "case",
        "miXed": "cAsE"
    },
    "queryStringParameters": {
        "key1": "value",
        "HeLLo": "world",
        "FOO": "BAR",
    },
    "pathParameters":null,
    "stageVariables": {
        "key1": "value",
        "HeLLo": "world",
        "FOO": "BAR",
    },
    "requestContext":{
        "accountId":"493938364882",
        "resourceId":"am2ulm",
        "stage":"prod",
        "requestId":"4c67a95d-fd58-11e6-b63c-97c7f4c3f106",
        "identity":{
            "cognitoIdentityPoolId":null,
            "accountId":null,
            "cognitoIdentityId":null,
            "caller":null,
            "apiKey":null,
            "sourceIp":"23.227.37.117",
            "accessKey":null,
            "cognitoAuthenticationType":null,
            "cognitoAuthenticationProvider":null,
            "userArn":null,
            "userAgent":"Ruby",
            "user":null
        },
        "resourcePath":"/shopify/order",
        "httpMethod":"POST",
        "apiId":"jwvlc9hgjg"
    },
    "body":"{\"id\":4870274641,\"email\":\"maxime@rainville.me\",\"closed_at\":null,\"created_at\":\"2017-02-27T14:50:35-11:00\",\"updated_at\":\"2017-02-27T14:50:35-11:00\",\"number\":19,\"note\":null,\"token\":\"b3e7b572a8fecb8965a4b1424b3e52ba\",\"gateway\":\"paypal-invoice\",\"test\":false,\"total_price\":\"286.35\",\"subtotal_price\":\"249.00\",\"total_weight\":272,\"total_tax\":\"37.35\",\"taxes_included\":false,\"currency\":\"USD\",\"financial_status\":\"paid\",\"confirmed\":true,\"total_discounts\":\"0.00\",\"total_line_items_price\":\"249.00\",\"cart_token\":null,\"buyer_accepts_marketing\":false,\"name\":\"#3-1004\",\"referring_site\":null,\"landing_site\":null,\"cancelled_at\":null,\"cancel_reason\":null,\"total_price_usd\":\"286.35\",\"checkout_token\":null,\"reference\":null,\"user_id\":105843784,\"location_id\":10590225,\"source_identifier\":\"10590225-3-1004\",\"source_url\":null,\"processed_at\":\"2017-02-27T14:50:33-11:00\",\"device_id\":3,\"browser_ip\":null,\"landing_site_ref\":null,\"order_number\":1019,\"discount_codes\":[],\"note_attributes\":[],\"payment_gateway_names\":[\"paypal-invoice\"],\"processing_method\":\"\",\"checkout_id\":null,\"source_name\":\"pos\",\"fulfillment_status\":null,\"tax_lines\":[{\"title\":\"GST\",\"price\":\"37.35\",\"rate\":0.15}],\"tags\":\"\",\"contact_email\":\"maxime@rainville.me\",\"order_status_url\":null,\"line_items\":[{\"id\":9411142609,\"variant_id\":26940988104,\"title\":\"Genie Mini\",\"quantity\":1,\"price\":\"249.00\",\"grams\":272,\"sku\":\"0032-0001\",\"variant_title\":\"Genie Mini\",\"vendor\":\"Syrp\",\"fulfillment_service\":\"manual\",\"product_id\":8141076040,\"requires_shipping\":true,\"taxable\":true,\"gift_card\":false,\"pre_tax_price\":\"249.00\",\"name\":\"Genie Mini - Genie Mini\",\"variant_inventory_management\":null,\"properties\":[],\"product_exists\":true,\"fulfillable_quantity\":1,\"total_discount\":\"0.00\",\"fulfillment_status\":null,\"tax_lines\":[{\"title\":\"GST\",\"price\":\"37.35\",\"rate\":0.15}]}],\"shipping_lines\":[],\"billing_address\":{\"first_name\":\"Maxime\",\"address1\":\"7 Linewood Aevnue\",\"phone\":null,\"city\":\"Auckland\",\"zip\":\"1025\",\"province\":\"Auckland\",\"country\":\"New Zealand\",\"last_name\":\"Rainville\",\"address2\":\"Mount Albert\",\"company\":\"\",\"latitude\":-36.8758217,\"longitude\":174.7215847,\"name\":\"Maxime Rainville\",\"country_code\":\"NZ\",\"province_code\":\"AUK\"},\"fulfillments\":[],\"refunds\":[],\"customer\":{\"id\":4979143569,\"email\":\"maxime@rainville.me\",\"accepts_marketing\":false,\"created_at\":\"2017-01-17T14:55:05-11:00\",\"updated_at\":\"2017-02-27T14:50:35-11:00\",\"first_name\":\"Maxime\",\"last_name\":\"Rainville\",\"orders_count\":11,\"state\":\"disabled\",\"total_spent\":\"2839.21\",\"last_order_id\":4870274641,\"note\":null,\"verified_email\":true,\"multipass_identifier\":null,\"tax_exempt\":false,\"phone\":null,\"tags\":\"\",\"last_order_name\":\"#3-1004\",\"default_address\":{\"id\":5250456593,\"first_name\":\"Maxime\",\"last_name\":\"Rainville\",\"company\":\"\",\"address1\":\"7 Linewood Aevnue\",\"address2\":\"Mount Albert\",\"city\":\"Auckland\",\"province\":\"Auckland\",\"country\":\"New Zealand\",\"zip\":\"1025\",\"phone\":null,\"name\":\"Maxime Rainville\",\"province_code\":\"AUK\",\"country_code\":\"NZ\",\"country_name\":\"New Zealand\",\"default\":true}}}",
    "isBase64Encoded":false
};

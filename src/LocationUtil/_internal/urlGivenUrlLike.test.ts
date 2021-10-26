import { Test } from "@anderjason/tests";
import { urlGivenUrlLike } from "./urlGivenUrlLike";

Test.define("urlGivenUrlLike returns the expected result", () => {
  const beforeAfter = [
    ["localhost", "http://localhost"],
    ["localhost:8000", "http://localhost:8000"],
    ["test.com", "http://test.com"],
    ["http://test.com", "http://test.com"],
    ["https://test.com", "https://test.com"],
    ["user:pwd@test.com:9000/something?param=1#hash", "http://user:pwd@test.com:9000/something?param=1#hash"],
    ["http://user:pwd@test.com:9000/something?param=1#hash", "http://user:pwd@test.com:9000/something?param=1#hash"],
    ["https://user:pwd@test.com:9000/something?param=1#hash", "https://user:pwd@test.com:9000/something?param=1#hash"],
    ["mailto:name@email.com", "mailto:name@email.com"],
    ["", null],
    [null, null],
    [undefined, null],
  ];

  beforeAfter.forEach((pair, idx) => {
    const actual = urlGivenUrlLike(pair[0]);
    const expected = pair[1];

    if (actual != expected) {
      console.log(`${idx} - Actual: '${actual}', expected: '${expected}'`);
    }

    Test.assert(actual == expected, "actual is equal to expected");
  });
});

Test.define("urlGivenUrlLike returns the expected result when assuming https", () => {
  const beforeAfter = [
    ["localhost", "https://localhost"],
    ["localhost:8000", "https://localhost:8000"],
    ["test.com", "https://test.com"],
    ["http://test.com", "http://test.com"], // http is preserved if present
    ["https://test.com", "https://test.com"],
    ["user:pwd@test.com:9000/something?param=1#hash", "https://user:pwd@test.com:9000/something?param=1#hash"],
    ["http://user:pwd@test.com:9000/something?param=1#hash", "http://user:pwd@test.com:9000/something?param=1#hash"],
    ["https://user:pwd@test.com:9000/something?param=1#hash", "https://user:pwd@test.com:9000/something?param=1#hash"],
    ["", null],
    [null, null],
    [undefined, null],
  ];

  beforeAfter.forEach((pair, idx) => {
    const actual = urlGivenUrlLike(pair[0], true);
    const expected = pair[1];

    if (actual != expected) {
      console.log(`${idx} - Actual: '${actual}', expected: '${expected}'`);
    }

    Test.assert(actual == expected, "actual is equal to expected");
  });
});
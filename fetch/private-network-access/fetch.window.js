// META: script=/common/utils.js
// META: script=resources/support.js
// META: script=resources/ports.sub.js
//
// Spec: https://wicg.github.io/private-network-access/#integration-fetch
//
// These tests verify that non-secure contexts cannot fetch subresources from
// less-public address spaces, and can fetch them otherwise.
//
// This file covers only those tests that must execute in a non secure context.
// Other tests are defined in: fetch.https.window.js

setup(() => {
  // Making sure we are in a non secure context, as expected.
  assert_false(window.isSecureContext);
});

promise_test(t => fetchTest(t, {
  source: { port: kPorts.httpLocal },
  target: { port: kPorts.httpLocal },
  expected: kFetchTestResult.success,
}), "local to local: no preflight required.");

promise_test(t => fetchTest(t, {
  source: { port: kPorts.httpLocal },
  target: {
    port: kPorts.httpPrivate,
    searchParams: { "final-headers": "cors" },
  },
  expected: kFetchTestResult.success,
}), "local to private: no preflight required.");

promise_test(t => fetchTest(t, {
  source: { port: kPorts.httpLocal },
  target: {
    port: kPorts.httpPublic,
    searchParams: { "final-headers": "cors" },
  },
  expected: kFetchTestResult.success,
}), "local to public: no preflight required.");

promise_test(t => fetchTest(t, {
  source: { port: kPorts.httpPrivate },
  target: {
    port: kPorts.httpLocal,
    searchParams: {
      "preflight-uuid": token(),
      "preflight-headers": "cors+pna",
      "final-headers": "cors",
    },
  },
  expected: kFetchTestResult.failure,
}), "private to local: failure.");

promise_test(t => fetchTest(t, {
  source: { port: kPorts.httpPrivate },
  target: { port: kPorts.httpPrivate },
  expected: kFetchTestResult.success,
}), "private to private: no preflight required.");

promise_test(t => fetchTest(t, {
  source: { port: kPorts.httpPrivate },
  target: {
    port: kPorts.httpPublic,
    searchParams: { "final-headers": "cors" },
  },
  expected: kFetchTestResult.success,
}), "private to public: no preflight required.");

promise_test(t => fetchTest(t, {
  source: { port: kPorts.httpPublic },
  target: {
    port: kPorts.httpLocal,
    searchParams: {
      "preflight-uuid": token(),
      "preflight-headers": "cors+pna",
      "final-headers": "cors",
    },
  },
  expected: kFetchTestResult.failure,
}), "public to local: failure.");

promise_test(t => fetchTest(t, {
  source: { port: kPorts.httpPublic },
  target: {
    port: kPorts.httpPrivate,
    searchParams: {
      "preflight-uuid": token(),
      "preflight-headers": "cors+pna",
      "final-headers": "cors",
    },
  },
  expected: kFetchTestResult.failure,
}), "public to private: failure.");

promise_test(t => fetchTest(t, {
  source: { port: kPorts.httpPublic },
  target: { port: kPorts.httpPublic },
  expected: kFetchTestResult.success,
}), "public to public: no preflight required.");

// These tests verify that documents fetched from the `local` address space yet
// carrying the `treat-as-public-address` CSP directive are treated as if they
// had been fetched from the `public` address space.

promise_test(t => fetchTest(t, {
  source: {
    port: kPorts.httpLocal,
    headers: { "Content-Security-Policy": "treat-as-public-address" },
  },
  target: {
    port: kPorts.httpLocal,
    searchParams: {
      "preflight-uuid": token(),
      "preflight-headers": "cors+pna",
      "final-headers": "cors",
    },
  },
  expected: kFetchTestResult.failure,
}), "treat-as-public-address to local: failure.");

promise_test(t => fetchTest(t, {
  source: {
    port: kPorts.httpLocal,
    headers: { "Content-Security-Policy": "treat-as-public-address" },
  },
  target: {
    port: kPorts.httpPrivate,
    searchParams: {
      "preflight-uuid": token(),
      "preflight-headers": "cors+pna",
      "final-headers": "cors",
    },
  },
  expected: kFetchTestResult.failure,
}), "treat-as-public-address to private: failure.");

promise_test(t => fetchTest(t, {
  source: {
    port: kPorts.httpLocal,
    headers: { "Content-Security-Policy": "treat-as-public-address" },
  },
  target: {
    port: kPorts.httpPublic,
    searchParams: { "final-headers": "cors" },
  },
  expected: kFetchTestResult.success,
}), "treat-as-public-address to public: no preflight required.");

// These tests verify that HTTPS iframes embedded in an HTTP top-level document
// cannot fetch subresources from less-public address spaces. Indeed, even
// though the iframes have HTTPS origins, they are non-secure contexts because
// their parent is a non-secure context.

promise_test(t => fetchTest(t, {
  source: {
    protocol: "https:",
    port: kPorts.httpsPrivate,
  },
  target: {
    protocol: "https:",
    port: kPorts.httpsLocal,
    searchParams: {
      "preflight-uuid": token(),
      "preflight-headers": "cors+pna",
      "final-headers": "cors",
    },
  },
  expected: kFetchTestResult.failure,
}), "private https to local: failure.");

promise_test(t => fetchTest(t, {
  source: {
    protocol: "https:",
    port: kPorts.httpsPublic,
  },
  target: {
    protocol: "https:",
    port: kPorts.httpsLocal,
    searchParams: {
      "preflight-uuid": token(),
      "preflight-headers": "cors+pna",
      "final-headers": "cors",
    },
  },
  expected: kFetchTestResult.failure,
}), "public https to local: failure.");

promise_test(t => fetchTest(t, {
  source: {
    protocol: "https:",
    port: kPorts.httpsPublic,
  },
  target: {
    protocol: "https:",
    port: kPorts.httpsPrivate,
    searchParams: {
      "preflight-uuid": token(),
      "preflight-headers": "cors+pna",
      "final-headers": "cors",
    },
  },
  expected: kFetchTestResult.failure,
}), "public https to private: failure.");

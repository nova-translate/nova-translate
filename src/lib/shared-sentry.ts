import { BrowserClient, defaultStackParser, getDefaultIntegrations, makeFetchTransport, Scope } from "@sentry/browser";

const excludedIntegrations = new Set(["BrowserApiErrors", "Breadcrumbs", "GlobalHandlers"]);

const integrations = getDefaultIntegrations({}).filter((defaultIntegration) => {
  return !excludedIntegrations.has(defaultIntegration.name);
});

const sentryClient = new BrowserClient({
  dsn: process.env.PLASMO_PUBLIC_SENTRY_DSN,
  stackParser: defaultStackParser,
  integrations,
  transport: makeFetchTransport,
});

// use in content script or content script ui environment
const scope = new Scope();
scope.setClient(sentryClient);

sentryClient.init(); // initializing has to be done after setting the client on the scope

export default scope;

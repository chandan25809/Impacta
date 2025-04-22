// cypress/integration/askQuestion.spec.js

describe("AskQuestion Page", () => {
    const makeToken = () => {
      const payload = btoa(JSON.stringify({ role: "user" }));
      return `xxx.${payload}.yyy`;
    };
  
    beforeEach(() => {
      // reset localStorage and set a fake token
      cy.clearLocalStorage();
      cy.window().then((win) => {
        win.localStorage.setItem("token", makeToken());
      });
    });
  
    it("displays all form fields", () => {
      cy.intercept("GET", "/api/campaigns", {
        statusCode: 200,
        body: { campaigns: [] },
      }).as("getCampaigns");
  
      cy.visit("/support/ask");
      cy.wait("@getCampaigns");
  
      cy.contains("Submit Your Question");
      cy.get("textarea").should("exist");
      cy.contains("label", "Type").should("exist");
      cy.contains("label", "Priority").should("exist");
      cy.contains("label", "Related Campaign (optional)").should("exist");
      cy.get('button[type=submit]').should("contain", "Submit");
    });
  
    it("loads and displays campaign options", () => {
      cy.intercept("GET", "/api/campaigns", {
        statusCode: 200,
        body: {
          campaigns: [
            { ID: 1, Title: "Camp A" },
            { ID: 2, Title: "Camp B" },
          ],
        },
      }).as("getCampaigns");
  
      cy.visit("/support/ask");
      cy.wait("@getCampaigns");
  
      // open the Related Campaign dropdown
      cy.contains("label", "Related Campaign (optional)")
        .closest(".ant-form-item")
        .find(".ant-select")
        .click();
  
      cy.get(".ant-select-dropdown").contains("Camp A");
      cy.get(".ant-select-dropdown").contains("Camp B");
    });
  
    it("shows an error toast if campaigns fetch fails", () => {
      cy.intercept("GET", "/api/campaigns", { forceNetworkError: true }).as(
        "getCampaignsFail"
      );
  
      cy.visit("/support/ask");
      cy.wait("@getCampaignsFail");
  
      cy.get(".ant-message-notice").should(
        "contain",
        "Failed to load campaigns."
      );
    });
  
    it("validates required fields before submit", () => {
      cy.intercept("GET", "/api/campaigns", {
        statusCode: 200,
        body: { campaigns: [] },
      }).as("getCampaigns");
  
      cy.visit("/support/ask");
      cy.wait("@getCampaigns");
  
      cy.get('button[type=submit]').click();
  
      cy.contains("Please enter your question").should("exist");
      cy.contains("Select type").should("exist");
      cy.contains("Select priority").should("exist");
    });
  
    it("submits the form successfully and navigates", () => {
      cy.intercept("GET", "/api/campaigns", {
        statusCode: 200,
        body: { campaigns: [{ ID: 3, Title: "Camp X" }] },
      }).as("getCampaigns");
  
      cy.intercept("POST", "/api/support-tickets", (req) => {
        // check auth header
        expect(req.headers.authorization).to.equal(`Bearer ${makeToken()}`);
  
        // parse and verify JSON body
        const body =
          typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        expect(body).to.deep.equal({
          query: "Test Q?",
          type: "technical",
          priority: "medium",
          campaign_id: 3,
          answer: "",
        });
  
        req.reply({ statusCode: 200 });
      }).as("postTicket");
  
      cy.visit("/support/ask");
      cy.wait("@getCampaigns");
  
      // fill out the form
      cy.get("textarea").type("Test Q?");
      cy.contains("label", "Type")
        .closest(".ant-form-item")
        .find(".ant-select")
        .click();
      cy.get(".ant-select-dropdown").contains("Technical").click();
  
      cy.contains("label", "Priority")
        .closest(".ant-form-item")
        .find(".ant-select")
        .click();
      cy.get(".ant-select-dropdown").contains("Medium").click();
  
      cy.contains("label", "Related Campaign (optional)")
        .closest(".ant-form-item")
        .find(".ant-select")
        .click();
      cy.get(".ant-select-dropdown").contains("Camp X").click();
  
      // submit and assert
      cy.get('button[type=submit]').click();
      cy.wait("@postTicket");
  
      cy.get(".ant-message-notice").should(
        "contain",
        "Your question has been submitted!"
      );
      cy.url().should("include", "/support");
    });
  
    it("shows an error toast on submission failure", () => {
      cy.intercept("GET", "/api/campaigns", {
        statusCode: 200,
        body: { campaigns: [] },
      }).as("getCampaigns");
  
      cy.intercept("POST", "/api/support-tickets", {
        statusCode: 500,
      }).as("postFail");
  
      cy.visit("/support/ask");
      cy.wait("@getCampaigns");
  
      cy.get("textarea").type("Another?");
      cy.contains("label", "Type")
        .closest(".ant-form-item")
        .find(".ant-select")
        .click();
      cy.get(".ant-select-dropdown").contains("Other").click();
  
      cy.contains("label", "Priority")
        .closest(".ant-form-item")
        .find(".ant-select")
        .click();
      cy.get(".ant-select-dropdown").contains("Low").click();
  
      cy.get('button[type=submit]').click();
      cy.wait("@postFail");
  
      cy.get(".ant-message-notice").should(
        "contain",
        "Failed to submit question."
      );
    });
  });
  
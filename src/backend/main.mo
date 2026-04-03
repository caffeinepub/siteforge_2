import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Site = {
    id : Text;
    title : Text;
    description : Text;
    content : Text;
    owner : Principal;
    status : {
      #draft;
      #published : Text;
      #listed : Listing;
      #sold : { buyer : Principal; salePrice : Nat; billOfSale : Text };
    };
    createdAt : Int;
    updatedAt : Int;
  };

  type Listing = {
    price : Nat;
    listingDescription : Text;
    listedAt : Int;
  };

  module Site {
    public func compare(site1 : Site, site2 : Site) : Order.Order {
      Text.compare(site1.id, site2.id);
    };
  };

  public type UserProfile = {
    username : Text;
    displayName : Text;
    bio : Text;
    joinedAt : Int;
  };

  public type Transaction = {
    id : Text;
    buyer : Principal;
    seller : Principal;
    siteId : Text;
    price : Nat;
    status : {
      #pending : Text;
      #completed : { billOfSale : Text };
      #cancelled : Text;
    };
    createdAt : Int;
    stripePaymentIntentId : Text;
  };

  public type LoginEvent = {
    principal : Principal;
    loginAt : Int;
  };

  type Dashboard = {
    sites : [Site];
    listings : [Site];
    transactions : [Transaction];
  };

  let sites = Map.empty<Text, Site>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let transactions = Map.empty<Text, Transaction>();
  let loginEvents = List.empty<LoginEvent>();

  func getSite(siteId : Text) : Site {
    switch (sites.get(siteId)) {
      case (null) { Runtime.trap("Site does not exist") };
      case (?site) { site };
    };
  };

  func getTransaction(transactionId : Text) : Transaction {
    switch (transactions.get(transactionId)) {
      case (null) { Runtime.trap("Transaction does not exist") };
      case (?transaction) { transaction };
    };
  };

  var nextId = 0;
  func generateUniqueId() : Text {
    let id = nextId;
    nextId += 1;
    id.toText();
  };

  // Record a login event for the caller
  public shared ({ caller }) func recordLogin() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot record login");
    };
    let event : LoginEvent = {
      principal = caller;
      loginAt = Time.now();
    };
    loginEvents.add(event);
  };

  // Get all login events (intended for admin use)
  public query func getLoginEvents() : async [LoginEvent] {
    loginEvents.toArray();
  };

  // Public query - anyone can view site details
  public query func getSiteById(siteId : Text) : async Site {
    getSite(siteId);
  };

  public shared ({ caller }) func createSite(title : Text, description : Text, content : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create sites");
    };
    let id = generateUniqueId();
    let newSite : Site = {
      id;
      title;
      description;
      content;
      owner = caller;
      status = #draft;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    sites.add(id, newSite);
    id;
  };

  public shared ({ caller }) func updateSite(id : Text, title : Text, description : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update sites");
    };
    let existingSite = getSite(id);
    if (existingSite.owner != caller) {
      Runtime.trap("Unauthorized: Only owner can update site");
    };
    let updatedSite : Site = {
      id;
      title;
      description;
      content;
      owner = caller;
      status = existingSite.status;
      createdAt = existingSite.createdAt;
      updatedAt = Time.now();
    };
    sites.add(id, updatedSite);
  };

  let urlPrefix = "https://my-builder-icp/";
  var urlCounter = 0;

  func generateUniqueUrl() : Text {
    let url = urlPrefix.concat(urlCounter.toText());
    urlCounter += 1;
    url;
  };

  public shared ({ caller }) func publishSite(siteId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can publish sites");
    };
    let site = getSite(siteId);
    if (site.owner != caller) {
      Runtime.trap("Unauthorized: Only owner can publish site");
    };
    let url = generateUniqueUrl();
    let updatedSite : Site = {
      id = site.id;
      title = site.title;
      description = site.description;
      content = site.content;
      owner = site.owner;
      status = #published(url);
      createdAt = site.createdAt;
      updatedAt = Time.now();
    };
    sites.add(siteId, updatedSite);
    url;
  };

  public shared ({ caller }) func listSite(id : Text, price : Nat, listingDescription : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list sites");
    };
    let site = getSite(id);

    if (site.owner != caller) {
      Runtime.trap("Unauthorized: Only owner can list site");
    };

    let listing : Listing = {
      price;
      listingDescription;
      listedAt = Time.now();
    };

    let listedSite : Site = {
      id;
      title = site.title;
      description = site.description;
      content = site.content;
      owner = site.owner;
      status = #listed(listing);
      createdAt = site.createdAt;
      updatedAt = Time.now();
    };

    sites.add(id, listedSite);
  };

  public shared ({ caller }) func unlistSite(siteId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlist sites");
    };
    let site = getSite(siteId);

    if (site.owner != caller) {
      Runtime.trap("Unauthorized: Only owner can unlist site");
    };

    switch (site.status) {
      case (#listed _) {};
      case (_) { Runtime.trap("Site is not listed") };
    };

    let updatedSite : Site = {
      id = site.id;
      title = site.title;
      description = site.description;
      content = site.content;
      owner = site.owner;
      status = #published("unlisted");
      createdAt = site.createdAt;
      updatedAt = Time.now();
    };

    sites.add(siteId, updatedSite);
  };

  // Public query - anyone can browse marketplace
  public query func getMarketplaceListings() : async [Site] {
    let listings = List.empty<Site>();
    for (site in sites.values()) {
      switch (site.status) {
        case (#listed(_)) {
          listings.add(site);
        };
        case (_) {};
      };
    };
    listings.toArray();
  };

  // Public query - anyone can browse marketplace
  public query func getMarketplaceListingIds() : async [Text] {
    let listingIds = List.empty<Text>();
    for (site in sites.values()) {
      switch (site.status) {
        case (#listed(_)) {
          listingIds.add(site.id);
        };
        case (_) {};
      };
    };
    listingIds.toArray();
  };

  public shared ({ caller }) func createPendingTransaction(siteId : Text, paymentIntentId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create transactions");
    };
    let transactionId = generateUniqueId();
    let site = getSite(siteId);
    switch (site.status) {
      case (#listed(listing)) {
        if (site.owner == caller) {
          Runtime.trap("Cannot purchase your own site");
        };
        let transaction : Transaction = {
          id = transactionId;
          buyer = caller;
          seller = site.owner;
          siteId;
          price = listing.price;
          status = #pending(paymentIntentId);
          createdAt = Time.now();
          stripePaymentIntentId = paymentIntentId;
        };
        transactions.add(transactionId, transaction);
      };
      case (_) { Runtime.trap("Site must be listed to create pending transaction") };
    };
    transactionId;
  };

  public shared ({ caller }) func finalizeTransaction(transactionId : Text, billOfSale : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can finalize transactions");
    };
    let transaction = getTransaction(transactionId);

    // Only buyer or seller can finalize
    if (transaction.buyer != caller and transaction.seller != caller) {
      Runtime.trap("Unauthorized: Only transaction parties can finalize");
    };

    let site = getSite(transaction.siteId);
    let updatedTransaction : Transaction = {
      id = transaction.id;
      buyer = transaction.buyer;
      seller = transaction.seller;
      siteId = transaction.siteId;
      price = transaction.price;
      status = #completed({ billOfSale });
      createdAt = transaction.createdAt;
      stripePaymentIntentId = transaction.stripePaymentIntentId;
    };

    let soldSite : Site = {
      id = site.id;
      title = site.title;
      description = site.description;
      content = site.content;
      owner = transaction.buyer;
      status = #sold({ buyer = transaction.buyer; salePrice = transaction.price; billOfSale });
      createdAt = site.createdAt;
      updatedAt = Time.now();
    };
    transactions.add(transactionId, updatedTransaction);
    sites.add(site.id, soldSite);
  };

  public shared ({ caller }) func updateDisplayName(displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    let existingProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };
    let updatedProfile : UserProfile = {
      username = existingProfile.username;
      displayName;
      bio = existingProfile.bio;
      joinedAt = existingProfile.joinedAt;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func updateUsername(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    let existingProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };
    let updatedProfile : UserProfile = {
      username;
      displayName = existingProfile.displayName;
      bio = existingProfile.bio;
      joinedAt = existingProfile.joinedAt;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func createProfile(username : Text, displayName : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (userProfiles.containsKey(caller)) { Runtime.trap("User profile already exists") };
    let profile : UserProfile = {
      username;
      displayName;
      bio;
      joinedAt = Time.now();
    };
    userProfiles.add(caller, profile);
  };

  // Public query - anyone can view profiles (required by frontend)
  public query func getProfile(user : Principal) : async UserProfile {
    if (userProfiles.containsKey(user)) {
      switch (userProfiles.get(user)) {
        case (null) {
          Runtime.trap("User profile does not exist");
        };
        case (?profile) {
          profile;
        };
      };
    } else {
      Runtime.trap("User profile does not exist");
    };
  };

  public shared ({ caller }) func updateBio(bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    let existingProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };
    let updatedProfile : UserProfile = {
      username = existingProfile.username;
      displayName = existingProfile.displayName;
      bio;
      joinedAt = existingProfile.joinedAt;
    };
    userProfiles.add(caller, updatedProfile);
  };

  // Required by frontend - get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Required by frontend - save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Required by frontend - get another user's profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getUserDashboard() : async Dashboard {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access dashboard");
    };
    let userSites = List.empty<Site>();
    let userListings = List.empty<Site>();
    let userTransactions = List.empty<Transaction>();

    sites.values().forEach(
      func(site) {
        if (site.owner == caller) {
          userSites.add(site);
        };
        switch (site.status) {
          case (#listed(_)) {
            if (site.owner == caller) {
              userListings.add(site);
            };
          };
          case (_) {};
        };
      }
    );

    transactions.values().forEach(
      func(transaction) {
        if (transaction.buyer == caller or transaction.seller == caller) {
          userTransactions.add(transaction);
        };
      }
    );

    {
      sites = userSites.toArray();
      listings = userListings.toArray();
      transactions = userTransactions.toArray();
    };
  };

  public query ({ caller }) func getTransactionById(id : Text) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    let transaction = getTransaction(id);
    // Only transaction parties can view transaction details
    if (transaction.buyer != caller and transaction.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only transaction parties can view transaction details");
    };
    transaction;
  };

  // Public query - anyone can search sites
  public query func getSiteByTitle(title : Text) : async Site {
    let matchingSites = List.empty<Site>();
    for (site in sites.values()) {
      if (site.title.contains(#text title)) {
        matchingSites.add(site);
      };
    };
    let matchingArray = matchingSites.toArray();
    if (matchingArray.size() == 0) {
      Runtime.trap("No sites matching title found");
    } else {
      matchingArray[0];
    };
  };

  // Public query - anyone can view sites by owner
  public query func getSitesByOwner(owner : Principal) : async [Site] {
    let ownerSites = List.empty<Site>();
    for (site in sites.values()) {
      if (site.owner == owner) {
        ownerSites.add(site);
      };
    };
    ownerSites.toArray();
  };

  // Public query - anyone can check if site is listed
  public query func isSiteListed(siteId : Text) : async Bool {
    let site = getSite(siteId);
    switch (site.status) {
      case (#listed(_)) { true };
      case (_) { false };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };
};

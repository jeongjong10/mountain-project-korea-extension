// Public /help-hub HTML and /js/pages/help-hub.js markup, inspected 2026-09-29.
export const gettingStartedCards = `
  <div class="hh-gs-card"><div class="hh-gs-num">01</div>
    <h3>Create your account</h3>
    <p>Sign up at mountainproject.com or download the <a href="https://apps.apple.com/us/app/mountain-project/id452308783" target="_blank">iOS</a> / <a href="https://play.google.com/store/apps/details?id=com.mountainproject.android" target="_blank">Android</a> app. Your data syncs across all devices.</p>
  </div>
  <div class="hh-gs-card"><div class="hh-gs-num">02</div>
    <h3>Find routes near you</h3>
    <p>Search by area name, route name, or let the app use your location to surface crags nearby.</p>
  </div>
  <div class="hh-gs-card"><div class="hh-gs-num">03</div>
    <h3>Read route beta</h3>
    <p>Browse route descriptions, grades, star ratings, and community comments to plan your day.</p>
  </div>
  <div class="hh-gs-card"><div class="hh-gs-num">04</div>
    <h3>Download areas for offline</h3>
    <p>In the app, navigate to Manage Areas and tap Download to save area and route information to your device — no cell signal needed. Photos are downloaded separately: open any area page and tap the "Download All Photos" link.</p>
    <p class="hh-gs-tip"><strong>Tip:</strong> To verify your download worked, put your phone in airplane mode, relaunch the app, and confirm the area and photos load.</p>
  </div>`;

export const helpHubControls = `
  <main id="help-hub-page">
    <section id="tab-help"><div id="hh-faq-sections"></div></section>
    <button class="hh-tab-btn" data-tab="getting-started">Getting Started</button>
    <button class="hh-tab-btn" data-tab="wishlist">&#x2736; Feature Requests</button>
    <div id="tab-getting-started">
      <h2>Get Started with Mountain Project</h2>
      <p>Four steps to go from zero to ready on your next adventure.</p>
      <div id="hh-gs-grid"></div>
      <p class="hh-gs-cta-title">Ready to go deeper?</p>
      <p class="hh-gs-cta-body">Browse the full topic library or <span class="hh-gs-cta-link" onclick="switchTab('help')">search for a specific question</span>.</p>
    </div>
    <div id="tab-wishlist">
      <h2>Feature Requests</h2>
      <p>Vote on what matters most. We review every request and post updates here.</p>
      <button class="hh-btn-submit">Submit a Request</button>
      <div id="hh-status-chips"><button class="hh-s-chip" onclick="setStatusFilter('all')">All <span class="cnt">70</span></button></div>
      <input id="hh-wl-search" placeholder="Search requests…" value="Newest">
      <button class="hh-wl-cat-btn"><span id="hh-cat-label">All Categories</span></button>
      <div id="hh-cat-filter-panel">
        <button class="hh-cat-filter-opt active" onclick="setWlCat('All')">All Categories</button>
        <button class="hh-cat-filter-opt" onclick="setWlCat('Mobile App')">Mobile App</button>
      </div>
      <button class="hh-wl-sort"><span id="hh-sort-label">Top Voted</span></button>
      <div id="hh-wishes-list"></div>
    </div>
    <div id="hh-modal" class="hh-modal-overlay hh-hidden"><div class="hh-modal">
      <h2 id="hh-modal-title">Submit a Feature Request</h2>
      <div class="hh-form-group">
        <label class="hh-form-label">Title <span class="hh-form-req">*</span></label>
        <input id="hh-form-title" maxlength="100" placeholder="Short, descriptive title for your request" value="Feature Requests">
      </div>
      <div class="hh-form-group">
        <label class="hh-form-label">Description <span class="hh-form-req">*</span></label>
        <textarea id="hh-form-desc" maxlength="500" placeholder="Describe the problem and how this feature would help…">Newest\nKeep my submitted description.</textarea>
        <p class="hh-char-count"><span id="hh-char-count">37</span>/500</p>
      </div>
      <div class="hh-form-group"><label>Category</label>
        <select id="hh-form-cat" name="category">
          <option>Topos &amp; Route Finding</option><option>Mobile App</option><option>Other</option>
        </select>
      </div>
      <div class="hh-forum-notice"><p>Your request will also be posted to the <a href="/forum/103989404/discuss-mountainprojectcom" target="_blank" rel="noopener">Discuss MP forum</a>.</p></div>
      <label class="hh-form-checkbox-label"><input type="checkbox" id="hh-form-lock"><span>Lock topic <span class="hh-form-hint">(prevents community comments)</span></span></label>
      <button class="hh-btn-cancel">Cancel</button><button id="hh-btn-submit" disabled>Submit Request</button>
      <div class="hh-modal-success hh-hidden"><p>Request submitted!</p></div>
    </div></div>
    <div id="hh-toast"><span class="hh-toast-msg"></span></div>
  </main>`;

export const featureRequestCard = `
  <div class="hh-wish-card">
    <div class="hh-wish-main">
      <button class="hh-vote-btn voted" onclick="vote(73)"><svg><polyline points="18 15 12 9 6 15"/></svg><span class="hh-vote-count">12</span></button>
      <div class="hh-wish-body">
        <span class="hh-status-badge"><span class="hh-dot"></span>In Progress</span>
        <span class="hh-cat-badge">Mobile App</span>
        <h3 class="hh-wish-title">Feature Requests</h3>
        <p class="hh-wish-desc">Newest\nKeep this submitted body and <a href="/help" title="Contact Us">Help Center</a>.</p>
        <div class="hh-wish-meta"><span>By <strong>New</strong> · Sep 2026</span>
          <span class="cmts">1 comment</span><button class="upd-link">MP response</button>
          <span class="hh-wish-actions"><button class="hh-wish-edit" title="Edit request" onclick="openEditModal(73)">Edit</button><button class="hh-wish-delete" title="Delete request" onclick="deleteRequest(73)">Delete</button></span>
        </div>
      </div>
    </div>
    <div class="hh-update-area open"><div class="hh-forum-post">
      <div class="hh-forum-avatar">N</div><div class="hh-forum-body">
        <div class="hh-forum-meta"><span class="hh-forum-author">New</span><span class="hh-mp-badge">MP Team</span><span class="hh-forum-date">Sep 2026</span><span class="hh-forum-likes">♡ 4</span></div>
        <p class="hh-forum-text">Save Changes\nKeep the author's exact text.</p>
      </div></div>
      <a href="https://www.mountainproject.com/forum/topic/73/example" class="hh-view-thread" target="_blank" rel="noopener noreferrer">View full thread on Mountain Project Forum →</a>
    </div>
  </div>`;

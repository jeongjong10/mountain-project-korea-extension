// Authenticated dropdown fixture shaped after Mountain Project's area/route chrome.
// Names and IDs are synthetic; fixed labels, href families, and data attributes are
// intentionally separated so tests can enforce the immutable data boundary.
export const AUTHENTICATED_DROPDOWNS_FIXTURE = `
  <div id="header-container">
    <div class="header-container__user">
      <div id="user" class="dropdown">
        <a id="user-trigger" class="dropdown-toggle" data-toggle="dropdown" href="/user/201509205/jean-kang">
          <span class="user-display-name">Jean Kang</span>
        </a>
        <div id="user-dropdown-menu" class="dropdown-menu dropdown-menu-right">
          <a id="profile-item" class="dropdown-item" href="/user/201509205/jean-kang">Profile</a>
          <a id="ticks-item" class="dropdown-item" href="/user/201509205/jean-kang/ticks">My Ticks</a>
          <a id="account-item" class="dropdown-item" href="/user/account">Account Settings</a>
          <a id="logout-item" class="dropdown-item" href="/auth/logout" data-login-context="header">Log out</a>
        </div>
      </div>
    </div>
  </div>

  <div id="climb-area-page">
    <div class="improve-page-general dropdown nowrap">
      <a id="improve-trigger" class="dropdown-toggle" data-toggle="dropdown" href="#">Improve This Page</a>
      <div class="dropdown-menu dropdown-menu-right">
        <a id="wrong-map-item" class="dropdown-item require-user" href="/improvement/map-location?id=106225629" data-login-context="wrong-map-location">Wrong Map Location?</a>
        <div id="suggest-header" class="dropdown-header">Suggest Change:</div>
        <a id="suggest-item" class="dropdown-item require-user" href="/improvement/general?id=106225629" data-login-context="suggest-changes">Suggest Changes</a>
        <a id="flag-name-item" class="dropdown-item require-user" href="/improvement/discriminatory-name?id=106225629" data-login-context="flag-discriminatory-name">Flag Discriminatory Name</a>
        <a id="other-suggestion-item" class="dropdown-item require-user" href="/improvement/other?id=106225629" data-login-context="other-suggestion">Other Suggestion</a>
        <a id="route-sort-item" class="dropdown-item require-user" href="/improvement/route-sort?id=106225629" data-login-context="route-sort">Route Sort</a>
        <a id="description-item" class="dropdown-item require-user" href="/improvement/description?id=106225629" data-login-context="description">Description</a>
        <a id="getting-there-item" class="dropdown-item require-user" href="/improvement/getting-there?id=106225629" data-login-context="getting-there">Getting There</a>
        <a id="photo-improvement-item" class="dropdown-item require-user" href="/improvement/photo?id=106225629" data-login-context="photo">Photo</a>
        <a id="edit-item" class="dropdown-item" href="/edit/climb-area/106225629">Edit Area</a>
        <a id="updates-item" class="dropdown-item" href="/updates/Climb-Lib-Models-Area/106225629">View Page Updates</a>
      </div>
    </div>

    <div class="dropdown" id="add-dropdown">
      <a id="add-trigger" class="dropdown-toggle" data-toggle="dropdown" href="#">Add To Page</a>
      <div class="dropdown-menu">
        <div class="dropdown-menu-section">
          <a id="add-route" class="dropdown-item require-user" href="/edit/route/0?parentId=106225629" data-login-context="add-route">
            <span class="dropdown-item-label">Route</span>
          </a>
          <a id="add-area" class="dropdown-item require-user" href="/add/climb-area/106225629" data-login-context="add-area">Sub-Area</a>
          <a id="add-photo" class="dropdown-item require-user" href="/area/106225629/add/photo" data-login-context="add-photo">Photo</a>
          <a id="copy-photo" class="dropdown-item require-user" href="/edit/imageLink/106225629?type=album" data-login-context="copy-photo" onclick="return photoClicked(112102756);">Photo (copy)</a>
          <a id="add-video" class="dropdown-item require-user" href="/share/video?areaId=106225629" data-login-context="add-video">Video</a>
          <a id="add-trail" class="dropdown-item require-user" href="/upload/start/trail?areaId=106225629" data-login-context="add-trail">Approach/Descent Trail</a>
          <a id="add-book" class="dropdown-item require-user" href="/edit/book/0?parentId=106225629" data-login-context="add-book">Book</a>
        </div>
      </div>
    </div>

    <button id="actions-trigger" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">
      <span>Share this Page</span>
    </button>
    <div id="actions-menu" class="dropdown-menu" aria-labelledby="actions-trigger">
      <div class="dropdown-menu-section">
        <div id="delete-item" class="dropdown-item"><span>Delete</span></div>
        <button id="add-photo-fallback" class="dropdown-item"><span>Add Photo</span></button>
        <a id="nested-route-name" class="dropdown-item" href="/route/106232568/chouinard-b">
          <span>Popular</span>
        </a>
        <div id="nested-photo-caption" class="dropdown-item">
          <span class="photo-caption">Popular</span>
        </div>
      </div>
    </div>

    <div class="dropdown" id="route-filter-dropdown">
      <button id="route-filter-trigger" class="dropdown-toggle" data-toggle="dropdown" data-value="Trad">
        <span id="route-type-label">Highlight</span>
      </button>
      <div class="dropdown-menu">
        <button class="dropdown-item route-type-option" data-value="">Show all routes</button>
        <button class="dropdown-item route-type-option" data-value="Trad">Trad</button>
        <button class="dropdown-item route-type-option" data-value="Sport">Sport</button>
      </div>
    </div>

    <div class="contribute-photos dropdown">
      <a id="photo-trigger" class="dropdown-toggle" data-toggle="dropdown" href="#">Add New Photo</a>
      <div class="dropdown-menu dropdown-menu-right">
        <a id="photo-area-item" class="dropdown-item" href="/area/106225629/add/photo">Add a Photo</a>
        <a id="photo-copy-item" class="dropdown-item require-user" href="/edit/imageLink/106225629?type=album" data-login-context="copy-photo">Photo (copy)</a>
      </div>
    </div>

    <div class="comments dropdown">
      <a id="sort-dropdown" class="dropdown-toggle" data-toggle="dropdown">
        <strong>Sort by:</strong> <span class="current-sort">Oldest</span>
      </a>
      <div class="dropdown-menu dropdown-menu-right">
        <a class="dropdown-item comments-sort" data-sort-order="newest" data-sort-order-name="Newest">Newest</a>
        <a class="dropdown-item comments-sort" data-sort-order="oldest" data-sort-order-name="Oldest">Oldest</a>
        <a class="dropdown-item comments-sort" data-sort-order="popular" data-sort-order-name="Popular">Popular</a>
      </div>
    </div>

    <a id="area-name" href="/area/106225629/south-korea">Sport</a>
    <a id="route-name" href="/route/106232568/chouinard-b">Popular</a>
    <a id="user-name" href="/user/11467/bryan-hylenski">Profile</a>
    <a id="photo-title" href="/photo/112102756/topo">Highlight</a>
  </div>
`;

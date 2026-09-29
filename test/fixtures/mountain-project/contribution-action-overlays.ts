// Source-informed fixture for Mountain Project's page-action dropdowns and shared modals.
// IDs, paths, and copy are limited to the fixed UI contract under test.
export const CONTRIBUTION_ACTION_MENUS_FIXTURE = `
  <div id="climb-area-page">
    <div class="improve-page-general dropdown nowrap inline-block">
      <a id="improve-trigger" href="#" class="dropdown-toggle" data-toggle="dropdown">
        Improve This Page <img class="arrow" alt="Drop down">
      </a>
      <div class="dropdown-menu" role="menu">
        <div class="dropdown-header">Improve This Page</div>
        <a id="suggest-general" role="menuitem"
          href="/improvement/general?objectType=Climb%5CLib%5CModels%5CArea&amp;id=106225629">Suggest Changes</a>
        <a id="edit-area" role="menuitem" href="/edit/climb-area/106225629">Edit Area</a>
        <a id="page-updates" role="menuitem"
          href="/updates/Climb-Lib-Models-Area/106225629/south-korea">View Page Updates</a>
      </div>
    </div>

    <div class="mt-half">
      <div class="dropdown nowrap">
        <a id="add-trigger" href="#" class="dropdown-toggle" data-toggle="dropdown">
          Add To Page <img class="arrow" alt="Drop down">
        </a>
        <div class="dropdown-menu" role="menu">
          <a id="add-route" role="menuitem" href="/edit/route/0?parentId=106225629">Add New Route</a>
          <a id="add-area" role="menuitem" href="/add/climb-area/106225629">Add New Area</a>
          <a id="add-photo" role="menuitem" href="/area/106225629/add/photo">Add New Photo</a>
          <a id="add-trail" role="menuitem" href="/upload/start/trail?areaId=106225629">Add an Approach Trail</a>
          <a id="add-book" role="menuitem" href="/edit/book/0?parentId=106225629">Add New Guidebook</a>
        </div>
      </div>
    </div>
  </div>
`;

export const CONTRIBUTION_OVERLAYS_FIXTURE = `
  <div class="modal fade login-modal" id="login-modal" role="dialog" aria-hidden="false">
    <div class="modal-content">
      <button id="login-close" type="button" class="close" data-dismiss="modal" aria-label="Close"></button>
      <h2 class="modal-title">Sign Up or Log In</h2>
      <div class="modal-body">
        <div class="all-sites-disclaimer">
          <p class="text-muted"><a id="account-link" href="https://www.adventureprojects.net">
            Your FREE account works with all Adventure Projects sites
          </a></p>
        </div>
        <a id="onx-login" href="/auth/login/onx">Continue with onX Maps</a>
        <a id="facebook-login" href="/auth/login/facebook">Sign in with Facebook</a>
        <div id="email-login">
          <form action="/auth/login/email" method="post">
            <input id="login-email" type="email" name="email" placeholder="Log in with email" value="climber@example.test">
            <input id="login-password" type="password" name="pass" placeholder="Password" value="keep-me">
            <button type="submit">Log In</button>
          </form>
        </div>
        <a class="lost-password-toggle" href="#">Password help</a>
        <div class="orSeparator"><span>OR</span><hr></div>
        <div id="email-signup">
          <form action="/auth/signup/start" method="post">
            <input id="signup-email" type="email" name="email" placeholder="Sign up with email" value="draft@example.test">
            <button type="submit">Sign Up</button>
            <span class="g-recaptcha-response">
              This site is protected by reCAPTCHA and the Google
              <a href="https://policies.google.com/privacy">Privacy Policy</a> and
              <a href="https://policies.google.com/terms">Terms of Service</a> apply.
            </span>
          </form>
        </div>
      </div>
    </div>
  </div>

  <div id="share-content-modal" class="modal share-content-modal" role="dialog">
    <h2 class="modal-title">Share on Mountain Project</h2>
    <a id="share-route" href="/share/trail">Create Route or Route</a>
    <a id="share-symbol" href="/edit/symbol">Add a Symbol</a>
    <a id="share-photo" href="/share/photo">Share a Photo</a>
    <a id="share-video" href="/share/video">Share a Video</a>
    <p><small>Taking other people's content (text, photos, etc) without permission is a copyright violation and NOT OKAY!</small></p>
  </div>

  <div id="global-modal" class="modal" data-orig-full-path="/add/climb-area/106225629">
    <button id="global-close" type="button" class="ap-close" data-dismiss="modal" aria-label="Close"></button>
    <h2 id="global-modal-title" class="modal-title">Suggest Changes</h2>
    <div id="global-modal-body"></div>
    <div id="modal-placeholder"><h2>Loading...</h2></div>
  </div>

  <div id="data-confirm-modal" class="modal" role="dialog">
    <h3 id="dataConfirmLabel">Please Confirm</h3>
    <button type="button" data-dismiss="modal">Cancel</button>
    <a id="data-confirm-ok" href="#">OK</a>
  </div>
`;

// Captured from the guest response for /add/climb-area/106225629 on 2026-09-28.
// Tokens and user-entered values are synthetic; element structure and fixed copy match production.
export const CONTRIBUTION_GUEST_ACCESS_FIXTURE = `
  <div id="access-gate" class="access-gate" tabindex="-1">
    <div class="access-gate__wrap">
      <div role="document" class="access-gate__content" tabindex="0">
        <div class="access-gate__message">
          <small class="text-muted hidden-sm-down">Welcome</small>
          <h2>Join the Community! It's FREE</h2>
          <p>Already have an account? <a id="guest-login-link" href="/auth/login" title="Login">Login to close this notice.</a></p>
        </div>
        <div class="access-gate__cta">
          <a id="guest-start-link" class="btn btn-primary btn-padded" href="/auth/login" title="Sign Up or Login">Get Started</a>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade login-modal" id="login-modal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"></button>
          <h2 class="modal-title">Sign Up or Log In</h2>
        </div>
        <div class="modal-body">
          <div class="container-fluid">
            <div class="text-xs-center all-sites-disclaimer">
              <p class="text-muted"><a href="https://www.adventureprojects.net">Your FREE account works with all Adventure Projects sites</a></p>
            </div>
            <div class="login-signup-block">
              <span class="wide"><a href="/auth/login/onx" class="btn btn-onx">Continue with onX Maps</a></span>
              <span class="wide"><a href="/auth/login/facebook" class="btn btn-facebook">Sign in with Facebook</a></span>
              <div id="email-login"></div>
              <a class="lost-password-toggle" href="#">Password help</a>
              <div class="orSeparator"><span>OR</span><hr></div>
              <div id="email-signup"></div>
            </div>
            <div class="lost-password-block" style="display: none">
              <div id="forgot-password"></div>
              <p class="mt-2 text-xs-center"><a class="lost-password-toggle" href="#">Cancel</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

export const CONTRIBUTION_GUEST_AJAX_FORMS_FIXTURE = {
  login: `
    <form class="wide" method="post" action="/auth/login/email">
      <input type="email" name="email" placeholder="Log in with email" value="climber@example.test">
      <input type="password" name="pass" placeholder="Password" value="keep-me">
      <input type="hidden" name="_token" value="csrf-login-token">
      <button type="submit" class="btn btn-primary btn-lg">Log In</button>
    </form>`,
  signup: `
    <form class="wide" method="post" action="/auth/signup/start">
      <input type="email" name="email" placeholder="Sign up with email" value="draft@example.test">
      <input type="hidden" name="_token" value="csrf-signup-token">
      <div class="g-recaptcha-response">
        <input type="hidden" name="g-recaptcha-response" value="captcha-token">
        <button type="submit" class="btn btn-primary btn-lg">Sign Up</button>
        <span>This site is protected by reCAPTCHA and the Google
          <a href="https://policies.google.com/privacy">Privacy Policy</a> and
          <a href="https://policies.google.com/terms">Terms of Service</a> apply.
        </span>
      </div>
    </form>`,
  forgot: `
    <form class="wide" method="post" action="https://www.mountainproject.com/auth/password/lost">
      <input type="email" name="email" placeholder="Email address" value="recover@example.test">
      <input type="hidden" name="_token" value="csrf-forgot-token">
      <button type="submit" class="btn btn-primary btn-l">Send Reset Email</button>
    </form>`,
} as const;

// Captured from the Area comment sorter. The production menu has no role=menuitem.
export const COMMENT_SORT_DROPDOWN_FIXTURE = `
  <div class="comments" id="comments-Climb-Lib-Models-Area-106225629">
    <div class="comments-header has-sort">
      <div class="dropdown sort float-xs-right">
        <a class="dropdown-toggle" id="sort-dropdown" data-toggle="dropdown">
          <strong>Sort by:</strong> <span class="current-sort">Oldest</span>
          <img class="dropdown-arrow" src="/img/downArrowBlack.svg" alt="Drop down">
        </a>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="sort-dropdown">
          <a class="dropdown-item comments-sort" data-show-all="true" data-sort-order="newest" data-sort-order-name="Newest">Newest</a>
          <a class="dropdown-item comments-sort" data-show-all="true" data-sort-order="oldest" data-sort-order-name="Oldest">Oldest</a>
          <a class="dropdown-item comments-sort" data-show-all="true" data-sort-order="popular" data-sort-order-name="Popular">Popular</a>
        </div>
      </div>
    </div>
  </div>
`;

// Captured from authenticated production contribution pages on 2026-09-29.
// Authentication tokens are synthetic; fixed copy, hierarchy, and form endpoints
// mirror production. User-entered values exercise the immutable server-data boundary.
export const CONTRIBUTION_VARIANT_FORMS_FIXTURE = {
  areaPhoto: `
    <div class="row page-title"><div class="col-xs-12"><h1>Adding photo to South Korea</h1><hr></div></div>
    <form method="post" enctype="multipart/form-data" id="editForm"
      action="/area/106225629/save/photo" novalidate="novalidate">
      <input type="hidden" name="_token" value="photo-csrf-token">
      <div id="add-video"><div class="gray-background p-2">
        <h3 class="dont-shrink">Guidelines</h3>
        <ul>
          <li>Avoid duplicating existing photos and too many "butt shots".</li>
          <li>Photos should be least 600 x 600 pixels.</li>
        </ul>
        <h3 class="dont-shrink">Copyright</h3>
        <fieldset class="form-group">
          <label><input type="checkbox" name="copyright"><strong class="ml-half">I, joel jeong
            (whdduf972@gmail.com), certify that I took this photo myself.</strong></label>
          <div class="text-warm ml-2">
            Copyright violations of any kind, including photos of guidebooks or taken from the web, will
            result in your account being disabled permanently. If you have <strong>explicit written
            permission</strong> from the owner of a photo you did not take, you can post it if you include
            "with permission from [source]" in the photo caption.
          </div>
        </fieldset>
        <h3 class="dont-shrink mb-1">Photo Upload</h3>
        <fieldset class="form-group tighter">
          <button id="filePick" class="btn btn-secondary" type="button">Choose File</button>
          <span id="path" class="text-muted">No file selected</span>
          <input accept=".jpg,.jpeg,.gif,.png" type="file" name="fileInput" id="fileInput" class="display-none">
        </fieldset>
      </div></div>
      <fieldset class="form-group tighter">
        <label class="primary">Description</label>
        <input id="title" name="title" maxlength="255" value="사용자가 작성한 사진 설명"
          placeholder="What's happening, or what are we looking at — even if it's obvious" class="form-control" type="text">
        <div class="form-char-count">255 characters</div>
      </fieldset>
      <fieldset class="form-group">
        <input type="hidden" name="id" value="106225629">
        <input type="hidden" name="attribution" value="&quot;&quot;">
        <button class="submit-button btn btn-primary">Save Photo</button>
        <a target="_top" id="cancelButton" href="/area/106225629/south-korea" class="btn btn-link cancel">Cancel</a>
      </fieldset>
    </form>`,
  routePhoto: `
    <h1>Add a Photo to Chouinard B</h1>
    <form id="route-photo-form" action="/route/106232568/add/photo" method="post" name="route-photo-upload">
      <input type="hidden" name="routeId" value="106232568">
      <label>Photo</label><input type="file" name="photo" accept="image/jpeg,image/png">
      <label>Caption</label><textarea name="caption">사용자가 작성한 루트 사진 설명</textarea>
      <button type="submit">Save Photo</button>
    </form>`,
  imageLink: `
    <div class="container-fluid">
      <div class="row page-title"><div class="col-xs-12"><h1>Add a Photo (Copy) to South Korea</h1><hr></div></div>
      <form class="edit-form" method="post" action="/edit/imageLink/106225629">
        <fieldset class="form-group">
          <label class="primary">Source Photo ID</label>
          <input name="sourceId" value="121689336" class="form-control" type="text">
        </fieldset>
        <fieldset class="form-group">
          <input type="hidden" name="_token" value="image-link-csrf-token">
          <button type="submit" class="btn btn-primary">Create Photo (Copy)</button>
          <a href="/area/106225629/south-korea" class="btn btn-link cancel">Cancel</a>
        </fieldset>
      </form>
      <div class="text-muted">
        The Source Photo ID is the number in the url of the photo you'd like to copy (such as 123456 here):
        <br>https://www.mountainproject.com/photo/<strong>123456</strong>/example-photo
      </div>
    </div>`,
  trailUpload: `
    <h1>Select One of the Following</h1>
    <h3>Upload a GPX, KMZ or KML File</h3>
    <form method="post" id="editForm" enctype="multipart/form-data" action="/upload/finish">
      <fieldset class="form-group">
        <button id="filePick" class="btn btn-secondary" type="button">Choose File</button>
        <span id="path" class="text-muted">No file selected</span>
        <input accept=".gpx,.kml,.kmz" type="file" name="fileInput" id="fileInput" class="display-none">
      </fieldset>
      <fieldset class="form-group">
        <input type="hidden" name="_token" value="trail-upload-token">
        <input type="hidden" name="areaId" value="106225629">
        <button class="submit-button btn btn-primary" disabled>Upload File</button>
      </fieldset>
    </form>
    <h3>Draw an Approach Trail on the Map</h3>
    <form method="post" action="/edit/modify-line" id="mapForm">
      <input type="hidden" name="x" value="14206279">
      <input type="hidden" name="y" value="4295045">
      <input type="hidden" name="areaId" value="106225629">
      <input type="hidden" name="drawFromScratch" value="1">
      <button class="submit-button btn btn-secondary">Open Map</button>
    </form>
    <div class="col-xs-12 faq">
      <h2 class="mb-1">Frequenty Asked Questions</h2>
      <div class="faq-item"><h3>What are Approach and Descent Trails?</h3><div>
        These mark the way from your car, trailhead, or another trail to the base of the climbing area or route. Descents are from the summit of a climb back to the base, or some other logical endpoint. Descents are most useful for alpine routes.
      </div></div>
      <div class="faq-item"><h3>How do I add one?</h3><div>
        On any area page, look for the 'Add to Page' link near the top right of the page.
      </div></div>
      <div class="faq-item"><h3>Can I add more than one for an area?</h3><div>
        Yes. You might do this if there is more than one popular approach to an area, or if you need to create multiple branches to different parts of an area.
      </div></div>
      <div class="faq-item"><h3>Do I need a GPS to create one?</h3><div>
        No, you can use a phone app, such as Motion GPS or even Google Maps to record a route. If you know it very well, you can also just 'draw' it on a map right on Mountain Project.
      </div></div>
      <div class="faq-item"><h3>Can I use this to document a traverse climb or technical hike?</h3><div>
        No. While similar, we don't want to make Approach or Descent trails confusing with technical routes.
      </div></div>
      <div class="faq-item"><h3>What about complicated areas, overlaps, or multiple nearby areas?</h3><div>
        Use a single trail to get to the general area, then create shorter branches to the neighboring areas.
      </div></div>
      <div class="faq-item"><h3>Do these need to follow established trails?</h3><div>
        While these do NOT need to follow established hiking trails, they should follow the most common, most SUSTAINABLE route to the area. Social trails and wandering climbers cause signficant damage.
      </div></div>
    </div>`,
  book: `
    <h1>New Book</h1>
    <form id="edit-book-form" class="edit-form" action="/edit/book/0" method="post">
      <input type="hidden" name="parentId" value="106225629">
      <input type="hidden" name="_token" value="book-csrf-token">
      <label class="primary">Name</label><input name="title" value="사용자가 입력한 도서명">
      <label class="primary">Description</label><textarea name="text">사용자가 입력한 설명</textarea>
      <label class="primary">Author / Publisher / Year</label><input name="biblio" value="사용자가 입력한 서지 정보">
      <label class="primary">URL</label><input name="link" value="https://example.test/guidebook">
      <button type="submit">Save Book</button>
      <a href="javascript: history.go(-1)" class="cancel">Cancel</a>
    </form>`,
} as const;

export const CONTRIBUTION_FLAG_MODAL_FIXTURE = `
  <div id="flag-content-modal" class="modal">
    <form method="post" id="flag-content-form">
      <p>Please tell us why:</p>
      <textarea class="short form-control" name="reason">사용자가 작성한 신고 이유</textarea>
      <input type="hidden" name="_token" value="flag-csrf-token">
      <input id="flag-action" type="submit" class="btn btn-primary" value="Flag It">
      <input id="server-action" type="submit" name="commit" value="Flag It">
      <a href="#" class="cancel">Cancel</a>
      <input type="hidden" name="id" value="106225629">
      <p class="mt-1 form-group small text-muted">
        An Adventure Projects staff member will review this and take an appropriate action, but we generally don't reply.
      </p>
    </form>
  </div>`;

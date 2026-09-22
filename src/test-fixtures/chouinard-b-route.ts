// Representative markup captured from the public Route page and its comments AJAX response.
// It intentionally keeps the production classes, nesting, and functional attributes while
// trimming repeated route/photo rows so tests stay readable.
export const CHOUINARD_B_ROUTE_FIXTURE = `
  <div id="share-content-modal" class="modal share-content-modal">
    <button type="button" class="close" data-dismiss="modal" aria-label="Close"></button>
    <h2 class="modal-title">Share on Mountain Project</h2>
    <a id="share-route" href="/share/trail">Create Route or
      Route <img class="arrow" src="/img/climb/downArrow.png" alt="Drop down"></a>
    <a href="/edit/symbol">Add a Symbol</a>
    <a href="/share/photo">Share a Photo</a>
    <a href="/share/video">Share a Video</a>
  </div>

  <div id="route-page">
    <div class="col-md-9 float-md-right">
      <div class="improve-page-general">
        <a id="improve-page" href="#" data-toggle="modal" data-target="#login-modal">Improve This Page</a>
      </div>
      <div><a id="add-page" href="#" data-toggle="modal" data-target="#login-modal">Add To Page</a></div>
      <div id="route-breadcrumb" class="mb-half small text-warm">
        <a href="/route-guide">All Locations</a> &gt;
        <a href="/area/105907743/international">International</a> &gt;
        <a href="/area/106661515/asia">Asia</a> &gt;
        <a href="/area/106225629/south-korea">S Korea</a> &gt;
        <a href="/area/119456750/seoulgyeonggi-do-northwest-korea">Seoul/Gyeonggi-do (Northwest Korea)</a> &gt;
        <a href="/area/106225638/insu-bong-bukhansan">Insu-bong (Bukhansan)</a>
      </div>
      <h1 id="route-name">Chouinard B
        <a id="suggest-change" href="#" data-toggle="modal" data-target="#login-modal">
          <img title="Suggest Change" alt="Suggest change" src="/img/icons/edit_climb.svg">
        </a>
      </h1>
      <h2 id="route-grade" class="inline-block">
        <span class="rateYDS">5.8 <a href="/international-climbing-grades"><span class="small">YDS</span></a></span>
        <span class="rateFrench">5b <a href="/international-climbing-grades"><span class="small">French</span></a></span>
        <span class="rateBritish">HVS 4c</span> PG13
      </h2>
      <span id="route-star-avg"><a id="stats-link" title="View Stats" href="/route/stats/106232568/chouinard-b">Avg: 3.2 from 30 votes</a></span>
    </div>

    <div class="col-md-3 left-nav">
      <div class="mp-sidebar">
        <h3>Routes in Insu-bong (Bukhansan)</h3>
        <button id="route-filter" class="dropdown-toggle" type="button" data-toggle="dropdown" title="Left to Right">
          <span id="route-type-label">Highlight</span><img alt="Drop down" src="/img/downArrowBlack.svg">
        </button>
        <button class="dropdown-item route-type-option" type="button" data-value="">Show all routes</button>
        <button class="dropdown-item route-type-option" type="button" data-value="Trad">Trad</button>
        <table id="left-nav-route-table">
          <tr><td><a id="nearby-route" href="/route/106232553/chouinard-a">Chouinard A</a> <span class="route-type Rock Trad">T <span class="rateYDS">5.10a</span></span></td></tr>
          <tr><td><strong>Chouinard B</strong> <span class="route-type Rock Trad">T <span class="rateYDS">5.8</span> PG13</span></td></tr>
          <tr id="left-nav-unsorted-label"><td><b>Unsorted Routes:</b></td></tr>
        </table>
        <div class="small text-warm">Order Wrong? <a id="sort-routes" href="#" data-toggle="modal">Sort Routes</a></div>
      </div>
    </div>

    <div class="col-md-9 main-content float-md-right">
      <div class="row" id="route-overview-row">
        <div class="col-lg-7 col-md-6" id="route-overview-primary">
          <div class="small mb-1" id="route-summary">
            <table class="description-details">
              <tr><td>Type:</td><td id="route-type">Trad, 500 ft (152 m), 5 pitches</td></tr>
              <tr><td>GPS:</td><td id="route-gps">37.66042, 126.98084</td></tr>
              <tr><td>FA:</td><td id="first-ascent">Yvon Chouinard</td></tr>
              <tr><td>Page Views:</td><td id="page-views">4,776 total · 22/month</td></tr>
              <tr><td>Shared By:</td><td><a id="shared-user" href="/user/106185566/coreylee">coreylee</a> on Aug 18, 2008 · <a href="/updates/route">Updates</a></td></tr>
              <tr><td>Admins:</td><td><a id="admin-user" href="/user/200253192/chan-kim">Chan Kim</a> <a href="/updates/route">Page Updates (admin only)</a></td></tr>
            </table>
          </div>

          <div id="you-and-route" class="bg-gray-background py-1 pl-1 pr-3 mt-1 inline-block">
            <div class="title-with-border-bottom mb-1">
              <h2>You &amp; This Route</h2>
              <a href="/route/stats/106232568/chouinard-b">30 Opinions</a>
            </div>
            <strong>Your To-Do List:</strong>
            <a id="todoToggle" href="#" title="Add/Remove from your personal To-Do List" class="require-user">Add To-Do</a>
            <strong>Your Star Rating:</strong>
            <img id="rating-star" onclick="setScore('routes', '106232568', 1, 1, 0);" alt="Rating">
            <strong>Your Difficulty Rating:</strong>
            <span id="your-route-score">-none-</span> <a id="change-rating" href="#" onclick="changeRating(); return false;">Change</a>
            <strong>Your Ticks:</strong><a id="add-tick" href="#" onclick="showTickForm(0); return false;">Add New Tick</a>
            <div id="tick-empty" class="mt-quarter">-none-</div>
          </div>
        </div>

        <div class="col-lg-5 col-md-6" id="route-onx-region" style="padding-left: 1rem">
          <div class="onx-explore">
            <a id="explore-3d" href="https://webmap.onxmaps.com/example" target="_blank">Explore this route in 3D</a>
          </div>
        </div>

        <div class="col-lg-5 col-md-6 hidden-sm-down" id="route-carousel-region" style="min-height: 300px">
          <div id="photo-carousel" class="carousel slide white-text shimmer" data-ride="carousel">
            <a class="photo-link" href="/photo/112217546/example" onclick="return photoClicked(112217546);"></a>
          </div>
        </div>
      </div>

      <div class="route-section">
        <h2>Description <a href="#"><img title="Suggest Change" alt="Suggest change"></a></h2>
        <div class="fr-view">
          <p id="description-one">Pitch 1 follows a finger crack to a bolted anchor.</p>
          <p id="description-two">Pitch 2 follows a thin flake past fixed protection.</p>
        </div>
      </div>
      <div class="route-section">
        <h2>Location</h2>
        <div class="fr-view"><p id="location-copy">The line begins north of the broad slab.</p></div>
      </div>
      <div class="route-section">
        <h2>Protection</h2>
        <div class="fr-view"><p id="protection-copy">Bring a single rack and small nuts.</p></div>
      </div>
      <div class="route-section">
        <h2>Descent</h2>
        <div class="fr-view"><p id="descent-copy">Use the established rappel anchors.</p></div>
      </div>

      <h2><a id="add-photo" href="#" data-toggle="modal">Add New Photo</a> Photos</h2>
      <div class="row" id="photo-cards">
        <div class="col-xs-4 card-with-photo">
          <a id="photo-link" class="card-with-photo photo-card" href="/photo/112217546/example" onclick="return photoClicked(112217546);">
            <div class="title-row text-truncate">A climber follows the corner above Seoul.</div>
          </a>
        </div>
      </div>

      <div class="comments" id="comments-Climb-Lib-Models-Route-106232568">
        <h2 class="comment-count">9 Comments</h2>
        <a id="sort-dropdown" data-toggle="dropdown"><strong>Sort by:</strong> <span class="current-sort">Oldest</span></a>
        <a class="comments-sort" data-sort-order-name="Newest">Newest</a>
        <a class="comments-sort" data-sort-order-name="Oldest">Oldest</a>
        <a class="comments-sort" data-sort-order-name="Popular">Popular</a>
        <form id="comment-form" class="add-comment-form" method="post" action="/ajax/comments/add">
          <textarea id="comment-textarea" name="comment" placeholder="Write a comment"></textarea>
          <h3>Comment Type:</h3>
          <label><input type="radio" name="type" value="LOSTFOUND"> Lost or Found Item <span class="small">self-destructs in 30 days</span></label>
          <label><input type="radio" name="type" value="CONDITION"> Temporary (Condition Report, Upcoming Event, etc) <span class="small">self-destructs in 90 days</span></label>
          <label><input type="radio" name="type" value="BETA"> Beta for this Route or Personal Opinion</label>
          <button type="submit">Post Comment</button>
        </form>
        <div class="comment-list"><img class="wait-gif" alt="loading"></div>
      </div>
    </div>
  </div>
`;

export const CHOUINARD_B_COMMENT_FIXTURE = `
  <button class="show-more-comments-trigger">Show 6 More Comments</button>
  <table class="main-comment width100" id="Comment-112217507">
    <tr>
      <td class="user"><a id="comment-author" href="/user/111351265/nate-d">Nate D</a></td>
      <td>
        <div class="comment-body">
          <span id="112217507-trimmed">The upper pitches have long sections... <a onclick="showFullComment('112217507')">more</a></span>
          <span id="112217507-full" style="display: none">The upper pitches have long sections between protection.</span>
          <span class="comment-time"><a href="#Comment-112217507">Oct 10, 2016</a></span>
        </div>
        <div class="like"><a class="like-trigger"><span>Beta: <span class="num-likes">0</span></span></a></div>
        <div class="flag"><a class="flag-trigger" href="#">Flag</a></div>
      </td>
    </tr>
  </table>
`;

export const CHOUINARD_B_STATS_FIXTURE = `
  <div id="header-container-print">Print logo</div>
  <div id="header-container"><nav id="header-nav">Global navigation</nav></div>
  <div id="div-gpt-ad-1614709329076-0">Advertisement</div>
  <div class="main-content-container">
    <div class="container-fluid">
      <div id="route-stats">
        <div class="row pt-main-content">
          <div class="col-xs-12">
            <div class="mb-half small text-warm" id="stats-breadcrumbs">
              <a href="/area/106225629/south-korea">S Korea</a> &gt;
              <a href="/route/106232568/chouinard-b">Chouinard B</a>
            </div>
            <h1>Statistics for Chouinard B</h1>
            <h2 class="inline-block mr-2"><span class="rateYDS">5.8</span></h2>
            <span id="route-star-avg">Avg: 3.2 from 30 votes</span>
          </div>
        </div>
        <link href="/dist/stats-table/block.css?v.3" rel="stylesheet">
        <div class="onx-stats-table" data-props='{"routeId":"106232568","isAdmin":false}'>
          <form id="stats-filter" action="/route/stats/106232568/chouinard-b" method="get">
            <label>Style <select name="style"><option>All</option></select></label>
            <button type="submit">Filter</button>
          </form>
          <table id="stats-ratings"><tbody><tr><td>5.8</td><td>18 votes</td></tr></tbody></table>
          <div id="stats-chart" role="img" aria-label="Rating distribution"></div>
          <table id="stats-ticks"><tbody><tr><td><a id="tick-user" href="/user/123/climber">Climber</a></td><td>Lead</td></tr></tbody></table>
          <a id="stats-page-two" href="/route/stats/106232568/chouinard-b?page=2">Next page</a>
          <a id="other-route" href="/route/106232553/chouinard-a">Chouinard A</a>
          <div id="stats-attribution">Mountain Project community data</div>
          <button id="login-control" class="require-user" type="button">Add tick</button>
        </div>
      </div>
    </div>
  </div>
  <div id="cookie-consent">Cookie notice</div>
  <div id="footer-container">Footer</div>
`;

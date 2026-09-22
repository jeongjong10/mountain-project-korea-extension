// The Area markup mirrors Mountain Project's public #sun-shade component. The
// Route variant covers the same optional component in a Route page context.
export const AREA_SUN_SHADE_FIXTURE = `
  <div id="climb-area-page">
    <div class="mt-3" id="sun-shade" data-area-id="106457411">
      <h2>
        Sun &amp; Shade
        <a href="#" data-toggle="modal" data-login-context="Make it Better!">
          <img id="edit-sun" src="/img/icons/edit_climb.svg"
            class="show-tooltip suggest-change-icon"
            title="Suggest Change" alt="Suggest change">
        </a>
      </h2>
      <div class="row">
        <div class="col-xs-12 col-sm-6 mb-3">
          <a id="sun-map-link" href="/map/106457411/mokuleia-wall?sun-angles=1"
            title="Sun Angle Details">
            <img id="sun-icon" src="/img/icons/sun.svg" alt="Sun &amp; Shade">
            Sun Angles Details:
            <div id="sunAngleMap" class="position-relative mt-half"
              data-bearing="0.00" style="height: 130px; background-position: center bottom"></div>
          </a>
        </div>
        <div class="col-xs-12 col-sm-6 mb-3">
          <div class="mb-half">Routes Mostly Face: <strong id="exposure-value">North · Southwest</strong></div>
          <div class="mb-half">
            Sunny Roughly <strong id="sun-time-value">6am to 9am</strong>
            <span class="text-muted">during high season</span>
          </div>
          <div id="sun-chart" class="sunTimeDisplay" role="img"
            aria-label="Sunny from 6am to 9am" data-start="6" data-end="9">
            <canvas id="sun-canvas" width="460" height="130"></canvas>
            <svg id="sun-svg" viewBox="0 0 460 130">
              <path id="sun-path" d="M0 65 L460 65"></path>
              <text id="sun-legend" x="8" y="20">Sunny</text>
            </svg>
          </div>
          <div id="sun-details"><strong>Details:</strong> Mokuleia sees morning sun until 9 AM.</div>
          <button id="sun-toggle" type="button" title="Show Sun Details"
            aria-label="Show Sun Details">Show Sun Details</button>
          <div id="sun-loading" role="status">Loading sun and shade data...</div>
        </div>
      </div>
    </div>
  </div>
`;

export const ROUTE_SUN_SHADE_FIXTURE = `
  <div id="route-page">
    <section id="sun-shade" data-route-id="106232568">
      <h3>Sun &amp; Shade</h3>
      <div class="mb-half">
        <a id="unknown-sun-details" href="#" data-toggle="modal">
          Sun Details Unknown. Know About It?
        </a>
      </div>
      <button id="route-sun-toggle" type="button" aria-label="Hide Sun Details">
        Hide Sun Details
      </button>
      <div id="sun-empty" role="status">No sun and shade data available.</div>
      <p id="route-authored-copy">Shade can be found behind the detached pillar after noon.</p>
    </section>
  </div>
  <p id="outside-sun-label">Sun &amp; Shade</p>
`;

const COMMON_INTRO = `
  <div class="mb-2">Alex Kim, thanks for improving data for all climbers! Please focus on factual changes based on your experience with Kalymnos.</div>`;

const COMMON_ACTIONS = `
  <button class="btn btn-primary" type="submit">Submit Changes</button>
  <a class="btn btn-link btn-sm cancel" href="#">Cancel</a>
  <div class="text-warm small mt-1">Your suggestions will be shared with Mountain Project Admins &amp; Staff for review.</div>`;

export const CONTRIBUTION_IMPROVEMENT_MODAL_FIXTURES = {
  routeSort: `
    <form id="improveForm" action="/improvement/route-sort" method="post">
      <h2 class="mb-2">Sort Routes in Kalymnos</h2>
      ${COMMON_INTRO}
      <ul>
        <li>For a route that starts above another, put them next to each other.</li>
        <li>In general, follow a guidebook's ordering. Careful with R to L versus L to R in a book!</li>
        <li>If routes span multiple formations, start with the left-most and keep going across formations.</li>
      </ul>
      <h2 class="text-xs-center">Sorted Left to Right</h2>
      <div class="label-left strong">« Left-most</div>
      <div id="sorted-routes">
        <a href="/route/111111111/entity-route">Entity Route</a>
        <input name="orderInput" type="hidden" value="111111111,222222222">
      </div>
      <div class="mt-2 text-nowrap">« Drag a route<br>to this column<br>to <strong>sort</strong> it</div>
      <div class="label-right strong">« Right-most</div>
      <h2 class="text-xs-center">Unsorted</h2>
      <input name="token" type="hidden" value="route-sort-token">
      ${COMMON_ACTIONS}
    </form>`,
  location: `
    <form action="/improvement/location" method="post">
      <h2 class="mb-2">Change Location of Kalymnos</h2>
      ${COMMON_INTRO}
      <p class="mb-quarter">Move the crosshair over Kalymnos. If it's a large area, mark the middle of it.</p>
      <p class="mb-half">It may take a few weeks to see the location updated.</p>
      <strong>If you aren't sure of the exact location, please cancel.</strong>
      <div id="map" aria-label="Map">
        <span class="small">routes</span>
        <span class="small">Routes - Experimental!</span>
        <button type="button" aria-label="Enter fullscreen" title="Enter fullscreen"></button>
        <button type="button" aria-label="Find my location" title="Find my location"></button>
        <button type="button" aria-label="Zoom in" title="Zoom in"></button>
        <button type="button" aria-label="Zoom out" title="Zoom out"></button>
        <button type="button" aria-label="Reset bearing to north" title="Reset bearing to north"></button>
        <button type="button" aria-label="Options"></button>
        <span aria-label="Mapbox logo"></span>
        <div id="zoom-tip">Zoom in to see details</div>
        <div class="strong p-half">Map Key</div>
        <label class="mb-quarter">To-Dos</label>
        <div class="text-muted mt-quarter small">Lat: <span data-coordinate>36.9500</span>, Lon: <span data-coordinate>26.9800</span></div>
      </div>
      <input name="x" type="hidden" value="26.9800">
      <input name="y" type="hidden" value="36.9500">
      <input name="config" type="hidden" value="preserve-map-config">
      ${COMMON_ACTIONS}
    </form>`,
  description: `
    <form action="/improvement/text-climb" method="post">
      <h2 class="mb-2">Kalymnos: Suggest Changes</h2>
      ${COMMON_INTRO}
      <div class="fr-box">
        <div class="fr-toolbar"><button type="button" title="Bold (Ctrl+B)">Bold</button></div>
        <div class="fr-wrapper">
          <div class="fr-element fr-view" contenteditable="true"><p>Keep <strong>Original</strong> formatting.<br><a href="/area/123456789/authored-link">Authored Link</a></p></div>
        </div>
      </div>
      <textarea id="text" name="text" placeholder="Your Suggested Text">&lt;p&gt;Keep &lt;strong&gt;Original&lt;/strong&gt; formatting.&lt;/p&gt;</textarea>
      <input name="subtype" type="hidden" value="106225630">
      <input name="token" type="hidden" value="description-token">
      ${COMMON_ACTIONS}
    </form>`,
  gettingThere: `
    <form action="/improvement/text-climb" method="post">
      <h2 class="mb-2">Kalymnos: Suggest Changes</h2>
      ${COMMON_INTRO}
      <div class="fr-box">
        <div class="fr-toolbar"><button type="button" title="Insert Link (Ctrl+K)">Insert Link</button></div>
        <div class="fr-wrapper">
          <div class="fr-element fr-view" contenteditable="true"><p>Take the ferry.<br>Then follow the <a href="https://example.test/original">original link</a>.</p></div>
        </div>
      </div>
      <textarea id="text" name="text" placeholder="Your Suggested Text">Take the ferry.\nThen follow the original link.</textarea>
      <input name="subtype" type="hidden" value="106225631">
      <input name="token" type="hidden" value="getting-there-token">
      ${COMMON_ACTIONS}
    </form>`,
  badName: `
    <form action="https://www.mountainproject.com/bad-name-report" method="post">
      <h2 class="mb-2">Report Discriminatory Name: Kalymnos</h2>
      <p>Mountain Project no longer tolerates names that are discriminatory in nature, including racism, sexism, homophobia, and other forms of bigotry.<br><br>Is "Kalymnos" discriminatory?</p>
      <input name="name" type="hidden" value="Kalymnos">
      <input name="token" type="hidden" value="bad-name-token">
      <button class="btn btn-primary" type="submit">Yes, Flag It for Review</button>
      <a class="btn btn-link btn-sm cancel" href="#">Cancel</a>
    </form>`,
  generic: `
    <form action="/improvement/generic" method="post">
      <h2 class="mb-2">Suggest Changes to Kalymnos</h2>
      ${COMMON_INTRO}
      <textarea name="text" placeholder="Better Description? Information missing? Something outdated or incorrect?">Authored generic suggestion</textarea>
      <input name="token" type="hidden" value="generic-token">
      ${COMMON_ACTIONS}
    </form>`,
} as const;

// Source-informed Route Finder DOM: minimal responsive rows and fixed form/UI contracts.
// Factual route destinations and sample values are not a current result set; icon resources are omitted.
export const SOUTH_KOREA_ROUTE_FINDER_FIXTURE = `
  <div class="row pt-main-content">
    <div class="col-xs-12">
      <div id="finder-summary" class="float-md-left">
        <h1>Climbing Route Finder</h1>
        <strong>Rock</strong> routes (<strong>Trad</strong> or <strong>Sport</strong> or <strong>Toprope</strong>) in <strong>South Korea</strong>. between <strong>5.7</strong> and <strong>5.11d</strong> with at least <strong>0 stars</strong>.<br>
        Sorted by Climb Area then Difficulty. Results 1 to 50 of 353. <a href="#settings">Change Settings</a>
        &middot;
        <a id="export-link" rel="nofollow" href="/route-finder-export?selectedIds=106225629&amp;type=rock">Export CSV</a>
      </div>
      <div class="float-md-right">
        <div class="pagination" id="top-pagination">
          <a class="no-click"><img alt="First"></a>
          <a class="no-click"><img alt="Previous"></a>
          <a class="no-click">1 of 8</a>
          <a id="next-page" href="/route-finder?selectedIds=106225629&amp;type=rock&amp;page=2"><img alt="Next"></a>
          <a href="/route-finder?selectedIds=106225629&amp;type=rock&amp;page=8"><img alt="Last"></a>
        </div>
        <a id="view-all" href="/route-finder?selectedIds=106225629&amp;type=rock&amp;viewAll=1">View All</a>
      </div>
    </div>
  </div>

  <div id="results">
    <table class="table table-striped route-table hidden-sm-up"><tbody>
      <tr class="route-row" id="mobile-route">
        <td>
          <a id="mobile-route-link" href="/route/127049143/pigeon" class="text-black route-row">
            <div class="float-xs-right"><span class="rateYDS">5.7</span><span class="scoreStars">★★★★</span></div>
            <div class="text-truncate"><strong>Pigeon(비둘기)</strong></div>
            <div class="small text-warm">Trad, Aid 4 pitches</div>
          </a>
          <div class="small text-warm"><a href="/area/119456750/seoulgyeonggi-do-northwest-korea">Seoul/Gyeonggi-&hellip;</a> &gt; <a href="/area/106225638/insu-bong-bukhansan">Insu-bong (Bukhansan)</a></div>
        </td>
      </tr>
    </tbody></table>

    <table class="table route-table hidden-xs-down"><thead>
      <tr class="screen-reader-only"><th>Route Name</th><th>Location</th><th>Star Rating</th><th>Difficulty</th><th>Date</th></tr>
    </thead><tbody>
      <tr class="route-row" id="desktop-route">
        <td><a id="desktop-route-link" href="/route/127049143/pigeon"><strong>Pigeon(비둘기)</strong></a></td>
        <td><a href="/area/119456750/seoulgyeonggi-do-northwest-korea">Seoul/Gyeonggi-&hellip;</a></td>
        <td><span class="scoreStars">★★★★</span><span class="text-muted small">3</span></td>
        <td><span class="rateYDS">5.7</span><span class="small text-warm"><span>Trad, Aid</span> <span class="text-nowrap">4 pitches</span></span></td>
      </tr>
      <tr class="route-row" id="proper-name-route">
        <td><a href="/route/999999999/rock"><strong>Rock</strong></a></td>
        <td><a href="/area/999999998/area">Area</a></td>
        <td></td><td><span class="rateYDS">5.8</span></td>
      </tr>
    </tbody></table>
  </div>

  <div class="pagination" id="bottom-pagination">
    <a aria-label="Previous">Previous</a><a aria-label="Next">Next</a>
  </div>

  <div class="bg-gray-background p-1 mt-2 inline-block">
    <a name="settings"></a>
    <h2>Change Settings</h2>
    <form id="routeFinderForm" name="routeFinderForm" method="get" action="/route-finder">
      <table><tbody>
        <tr><td>Location:</td><td>
          <input id="initial-id-single" type="hidden" name="selectedIds" value="106225629">
          <strong><span id="single-area-picker-name">South Korea</span></strong>
          <a id="change-location" href="javascript: changeAreaPickerLocation('single', 0);">Change</a>
        </td></tr>
        <tr><td>Type:</td><td>
          <select id="type" name="type"><option selected value="rock">Rock</option><option value="boulder">Boulder</option><option value="aid">Aid</option><option value="ice">Ice</option><option value="mixed">Mixed</option></select>
          <select id="diffMinrock" name="diffMinrock"><option selected value="1800">5.7</option></select>
          &nbsp;to&nbsp;
          <select id="diffMaxrock" name="diffMaxrock"><option selected value="5500">5.11d</option></select>
          <div id="typeOptions"><label><input type="checkbox" name="is_trad_climb" value="1" checked> Trad</label><label><input type="checkbox" name="is_sport_climb" value="1" checked> Sport</label><label><input type="checkbox" name="is_top_rope" value="1" checked> Toprope</label></div>
        </td></tr>
        <tr><td>Quality:</td><td><select id="stars" name="stars"><option selected value="0">All star ratings</option><option value="2.8">2+ of 4 stars</option></select></td></tr>
        <tr><td>Pitches:</td><td><select id="pitches" name="pitches"><option selected value="0">Any pitches</option><option value="1">Exactly 1</option><option value="2">At least 2</option><option value="6">6+ pitches</option></select></td></tr>
        <tr><td>Sort by:</td><td><select id="sort1" name="sort1"><option selected value="area">Area</option><option value="rating">Difficulty</option><option value="popularity desc">Popularity</option><option value="title">Name</option></select> then: <select id="sort2" name="sort2"><option value="area">Area</option><option selected value="rating">Difficulty</option></select></td></tr>
        <tr><td></td><td><input id="find-routes" type="submit" value="Find Routes"></td></tr>
      </tbody></table>
    </form>
  </div>
`;

export const ROUTE_FINDER_STATES_FIXTURE = `
  <section id="finder-states">
    <label>Route Type: <select><option>Rock</option></select></label>
    <button>Apply Filters</button><button>Reset Filters</button>
    <div role="status" aria-label="Loading...">Loading...</div>
    <div role="status">No routes match your filters.</div>
    <div role="alert">Unable to load routes.</div>
    <button aria-label="Retry">Retry</button>
  </section>
`;

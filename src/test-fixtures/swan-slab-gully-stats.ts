// Reduced from the public Swan Slab Gully Stats HTML and its stats-table bundle.
export const SWAN_SLAB_GULLY_STATS_FIXTURE = `
  <div id="route-stats">
    <div class="row pt-main-content">
      <div class="col-xs-12">
        <div class="mb-half small text-warm">
          <a href="/route-guide">All Locations</a> &gt;
          <a href="/area/105708959/california">California</a> &gt;
          <a href="/area/105833381/yosemite-national-park">Yosemite NP</a> &gt;
          <a href="/area/105841123/swan-slab">A. Swan Slab</a> &gt;
          <a id="route-link" href="/route/105889783/swan-slab-gully">
            Swan Slab Gully (<span class="rateYDS">5.6</span> <span class="rateFrench">4c</span>)
          </a>
        </div>
        <h1 id="stats-title">Statistics for Swan Slab Gully</h1>
        <h2 id="stats-grade" class="inline-block mr-2">
          <span class="rateYDS">5.6 <a href="/international-climbing-grades"><span class="small">YDS</span></a></span>
          <span class="rateFrench">4c <a href="/international-climbing-grades"><span class="small">French</span></a></span>
        </h2>
        <span id="route-star-avg">
          <a class="show-tooltip" title="View Stats" href="/route/stats/105889783/swan-slab-gully">
            <span class="scoreStars"><img id="star-chart" src="/img/stars/starBlue.svg" alt=""></span>
            Avg: 2.5 from 638 votes
          </a>
        </span>
      </div>
    </div>

    <div class="onx-stats-table" data-props='{"routeId":"105889783","isAdmin":false}'>
      <div id="suggested-ratings-column">
        <h3>Suggested Ratings <span class="small text-muted">132</span></h3>
        <table class="table table-striped"><tbody>
          <tr id="ratings.2417585">
            <td><a id="rating-user" href="/user/200828566">Melissa Daigle</a></td>
            <td id="suggested-grade">5.8-</td>
          </tr>
        </tbody></table>
        <button id="ratings-more" type="button">Show More</button>
      </div>

      <div id="star-ratings-column">
        <h3>Star Ratings <span class="small text-muted">638</span></h3>
        <table class="table table-striped"><tbody>
          <tr id="stars.132279830">
            <td><a id="star-user" href="/user/202023510">Abby Miller</a></td>
            <td><span class="scoreStars" id="star-distribution-chart">★★★★★</span></td>
          </tr>
        </tbody></table>
        <button type="button">Show More</button>
      </div>

      <div id="todo-column">
        <h3>On To-Do Lists <span class="small text-muted">1,851</span></h3>
        <table class="table table-striped"><tbody>
          <tr>
            <td><a id="todo-user" href="/user/10790">Randy Carmichael</a>
              <div class="small text-warm">In Partner Finder</div>
            </td>
          </tr>
        </tbody></table>
        <button type="button">Show More</button>
      </div>

      <div id="ticks-column">
        <h3>Ticks <span class="small text-muted">4,261</span></h3>
        <table class="table table-striped"><tbody id="ticks-body">
          <tr id="ticks.203864354">
            <td class="text-nowrap"><a id="tick-user" href="/user/200000001">Tyler Allen</a></td>
            <td><div class="small"><div id="tick-details"><strong id="tick-date">Sep 20, 2026</strong> · Lead / Onsight. LED pitch 2. Barefoot. Got passed by two guys soloing. Super fun!<img id="delete-tick" class="delete pointer" data-id="203864354" alt="delete" src="/img/icons/trash.svg"></div></div></td>
          </tr>
          <tr id="ticks.203000000">
            <td class="text-nowrap"><strong>Private Tick</strong></td>
            <td><div class="small"><div><strong>Sep 1, 2026</strong><span class="small text-muted"> · No names/notes</span></div></div></td>
          </tr>
        </tbody></table>
        <button id="ticks-more" type="button" aria-label="Show More">Show More</button>
      </div>
    </div>
  </div>
`;

export const STATS_STANDARD_CONTROLS_FIXTURE = `
  <section id="stats-standard-controls">
    <h3>Tick Statistics</h3>
    <label>Filter <select><option>All</option></select></label>
    <label>Sort by: <select><option>Newest</option><option>Oldest</option></select></label>
    <table><thead><tr><th>Climber</th><th>Date</th><th>Notes</th><th>Difficulty</th><th>Stars</th><th>Percentage</th></tr></thead></table>
    <button aria-label="Previous">Previous</button>
    <button aria-label="Next">Next</button>
    <div role="status" aria-label="No ticks yet.">No ticks yet.</div>
  </section>
`;

/** Sanitized Partner Finder structures checked against the owned CfT session on 2026-09-29. */
export const PARTNER_FINDER_SEARCH_FIXTURE = `
  <div class="main-content-container"><div class="container-fluid">
    <div class="row page-title"><div class="col-xs-12"><h1>Partner Finder</h1></div></div>
    <div class="row"><div class="col-md-7"><h2>Search for a partner</h2>
      <div class="bg-gray-background p-1">
        <p>All fields are optional. The more fields you fill in, the fewer results you'll get.</p>
        <form action="/partner-finder/results" method="get">
          <input type="hidden" name="_token" value="">
          <label class="primary">Age</label>
          <select name="min-age"><option value="-" selected>-</option><option value="21">21</option></select>
          <p>to</p>
          <select name="max-age"><option value="-" selected>-</option><option value="65">65</option></select>
          <p>years old</p>
          <label class="primary">Location</label>
          <input name="location" value="Testville" placeholder="Postal (zip) code">
          <p>within</p><select name="distance"><option value="25" selected>25</option></select><p>miles</p>
          <label class="primary">Climbing Type</label>
          <p>Find people who climb at least...</p>
          <label><input type="checkbox" name="trad" value="1">Trad</label>
          <p class="text-muted">Lead</p><p class="text-muted">Follow</p>
          <button type="button">Find Partners</button>
        </form>
      </div>
    </div><div class="col-md-5"><h2>Or, post a message looking for a partner</h2></div></div>
  </div></div>`;

export const PARTNER_FINDER_RESULTS_FIXTURE = `
  <div class="main-content-container"><div class="container-fluid">
    <div class="row page-title"><div class="col-xs-12">
      <h1>Partner Finder</h1><p class="lead mb-quarter">Found 1 possible partners who:</p>
      <ul class="mb-half"><li>live within 25 miles of Testville</li></ul>
      <p class="ml-half"><a href="/partner-finder">&laquo; Change search</a></p>
    </div></div>
    <div class="row mt-1"><div class="col-xs-12"><div class="table-responsive">
      <table class="table table-sm"><tbody>
        <tr class="hidden-md-down"><th>Name</th><th>Vitals</th><th>Climbs</th><th>Best Times</th><th>Other Interests</th><th>More</th></tr>
        <tr class="even" id="partner-row">
          <td class="text-nowrap"><a href="/user/900000001/fixture-climber">Fixture Climber</a><br><span>Last visit:</span> Sep 29, 2026</td>
          <td class="small text-nowrap">Testville, ZZ<br>Female, 38<br>Trad, Sport, Gym</td>
          <td class="small text-nowrap hidden-sm-down">Trad: leads 5.10a, follows 5.10c<br>Sport: leads 5.10d, follows 5.11a<br>Boulders: V4</td>
          <td class="small hidden-md-down">Weekday mornings.<br>Weekend afternoons.</td>
          <td class="small hidden-md-down">Trail running and coffee.</td>
          <td class="small hidden-md-down">Looking for a careful partner near Testville.<br><a href="/route/900000010/granite-test-route">Granite Test Route V2</a></td>
        </tr>
      </tbody></table>
    </div></div></div>
  </div></div>`;

export const PARTNER_FINDER_REMAINING_UI_FIXTURE = `
  <div class="main-content-container"><div class="container-fluid">
    <div class="row page-title"><div class="col-xs-12">
      <h1>Partner Finder</h1>
      <p id="partner-result-count" class="lead mb-quarter" data-heading-source="server">Found <span class="result-count" data-count-source="server" aria-label="result count">500</span> possible partners who:</p>
    </div></div>
    <div class="row mt-1"><div class="col-xs-12"><div class="table-responsive">
      <table class="table table-sm"><tbody>
        <tr class="even" id="live-partner-row">
          <td><a href="/user/900000003/female-trad">Female Trad</a></td>
          <td>Sport<br>Female, unknown<br>Trad, Sport, TR, Gym</td>
          <td>Trad: leads 5.10a, follows 5.10c</td>
          <td><strong>Best times:</strong><br>Trad, Sport, TR, Gym are all mentioned in this free-form preference.<span class="authored-result-phrase">Found 77 possible partners who:</span></td>
          <td><strong>Other interests:</strong><br>Female, unknown is preserved when it is authored text.</td>
          <td>Looking for a partner on <a href="/route/900000011/tr-gym-route">TR Gym Route</a>.</td>
        </tr>
        <tr class="odd" id="male-partner-row">
          <td><a href="/user/900000004/male-sport">Male Sport</a></td>
          <td>Trad<br>Male, unknown<br>Gym</td>
          <td>Sport: leads 5.9, follows 5.10a</td>
          <td><strong>Best times:</strong><br>Weekends.</td>
          <td><strong>Other interests:</strong><br>Route names and locations stay untouched.</td>
          <td><a href="/route/900000012/female-unknown">Female Unknown</a></td>
        </tr>
      </tbody></table>
    </div></div></div>
  </div></div>`;

export function dynamicPartnerRow(id = '900000002'): string {
  return `<tr class="odd" id="dynamic-partner-row">
    <td><a href="/user/${id}/dynamic-climber">Dynamic Climber</a></td>
    <td>New Town, ZZ<br>Male, 31</td><td>Sport: leads 5.9, follows 5.10a</td>
    <td>Tuesday evenings.</td><td>Photography.</td><td>Safe belays and clear plans.</td>
  </tr>`;
}

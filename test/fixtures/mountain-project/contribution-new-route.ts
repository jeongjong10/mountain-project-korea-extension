// Captured from the authenticated New Route form on 2026-09-29.
// Tokens and authored values are synthetic; fixed copy, hierarchy, names,
// option values, links, and the form endpoint mirror production.
export const CONTRIBUTION_NEW_ROUTE_FIXTURE = `
  <div class="row pt-main-content">
    <div class="col-xs-12">
      <h1>New Route</h1>
      <div class="pt-2">
        <h2>Creating a New Route <span><a href="#">FAQ about new areas &amp; routes</a></span></h2>
        <strong>Step 1: Route Basics &nbsp;« You are here.</strong><br>
        Step 2: Sort Route in Area<br>
        Step 3: Add a photo (optional)<br>
        Step 4: Manage Pitches (optional)<br>
      </div>
    </div>
  </div>
  <form class="edit-form" id="edit-route-form" method="post" action="/edit/route/0">
    <fieldset><label class="primary">Route Name</label><input name="title" value="사용자 루트명"></fieldset>
    <fieldset>
      <label class="primary">First Ascent</label>
      <div class="text-muted small">Pro tip: "[[1234]], Feb 1972" will auto-link to user with ID 1234.</div>
      <input name="first_ascent" value="사용자 초등 정보">
    </fieldset>
    <fieldset><label class="primary">Length in Feet</label><span class="field-note">Approximate is fine.</span><input name="heightfeet" value="120" type="number"></fieldset>
    <fieldset><label class="primary">Pitches</label><span class="field-note">As it's most commonly done.</span><input name="pitches" value="2" type="number"></fieldset>
    <fieldset>
      <label class="primary">GPS</label><span class="field-note">Lat and Long</span>
      <p class="field-note">Lat and Long for the start of route. Use decimal degrees. Coordinates can be found on onX Backcountry.</p>
      <a id="onx-link" href="https://webmap.onxmaps.com/backcountry?mode=climb&amp;utm_source=mountainproject" target="_blank">onX Backcountry ⧉</a>
      <label for="y">Latitude</label><input name="y" id="y" value="37.1234">
      <label for="x">Longitude</label><input name="x" id="x" value="127.5678">
    </fieldset>
    <fieldset>
      <label class="primary" id="route-type-label">Route Type</label>
      <label><input type="radio" name="tradSport" value="sport" checked> Sport - most people lead with just quickdraws.</label>
      <label><input type="radio" name="tradSport" value="trad"> Trad - most people use some trad gear. There may also be bolts.</label>
      <label><input type="radio" name="tradSport" value=""> Other - boulder problem, TR (but not trad or sport), snow route, etc.</label>
      <label><input type="checkbox" name="toprope"> Toprope - you can set up a TR without leading the route.</label>
    </fieldset>
    <fieldset><label class="primary">New Route</label><label><input name="newRoute" type="checkbox"> This is a new first ascent!</label></fieldset>
    <fieldset>
      <label class="primary">Rating</label><span class="field-note">Only choose ratings that apply to this route.<br><a id="grades-link" href="/international-climbing-grades">International comparison chart</a></span>
      <table class="rating-table"><tbody>
        <tr><td>Rock</td><td><select name="rock"><option value="0"> - </option><option value="2100" selected>5.8</option></select></td></tr>
        <tr><td>Snow</td><td><select name="snow"><option value="80000" selected>Easy Snow</option></select></td></tr>
      </tbody></table>
    </fieldset>
    <fieldset>
      <label class="primary">Safety</label>
      <select name="safety">
        <option value="">- Good protection</option>
        <option value="PG13" selected>PG13 - Slightly runout</option>
        <option value="R">R - A fall could be dangerous</option>
        <option value="X">X - A fall could be your last</option>
      </select>
    </fieldset>
    <fieldset><label class="primary">Grade</label><span class="field-note">Usually for mountaineering or long routes.</span><select name="grade"><option value="III" selected>III</option></select></fieldset>
    <fieldset><label class="primary">Your Star Rating</label><input type="hidden" name="score_" value="4"></fieldset>
    <fieldset>
      <label class="primary">Description</label>
      <div id="description-editor" class="fr-box">
        <button type="button" title="Bold (Ctrl+B)"><span class="fr-sr-only">Bold</span></button>
        <button type="button" title="Italic (Ctrl+I)"><span class="fr-sr-only">Italic</span></button>
        <button type="button" title="Strikethrough (Ctrl+S)"><span class="fr-sr-only">Strikethrough</span></button>
        <button type="button" title="Insert Link (Ctrl+K)"><span class="fr-sr-only">Insert Link</span></button>
        <button type="button" title="Ordered List"><span class="fr-sr-only">Ordered List</span></button>
        <a title="Default">Default</a><a title="Lower Alpha">Lower Alpha</a><a title="Lower Greek">Lower Greek</a>
        <a title="Lower Roman">Lower Roman</a><a title="Upper Alpha">Upper Alpha</a><a title="Upper Roman">Upper Roman</a>
        <button type="button" title="Unordered List"><span class="fr-sr-only">Unordered List</span></button>
        <a title="Circle">Circle</a><a title="Disc">Disc</a><a title="Square">Square</a>
        <span class="fr-placeholder">Where's the crux? What's good / bad? Details, opinions, and deep thoughts.</span>
        <span class="fr-counter">Characters : 0/10000</span>
      </div>
      <textarea id="Description" name="Description">사용자 설명</textarea>
    </fieldset>
    <fieldset><label class="primary">Location</label><textarea id="Location" name="Location">사용자 위치 설명</textarea></fieldset>
    <fieldset><label class="primary">Protection</label><textarea id="Protection" name="Protection" placeholder="What type of pro? Bolts or fixed gear? Anchors at top?">사용자 보호 장비 설명</textarea></fieldset>
    <input type="hidden" name="_token" value="route-csrf-token">
    <input type="hidden" name="parentId" value="106225638">
    <button type="submit">Save Route</button><a href="javascript: history.go(-1)" class="cancel">Cancel</a>
  </form>`;

export const CONTRIBUTION_NEW_ROUTE_DYNAMIC_FROALA_FIXTURE = `
  <div id="location-editor" class="fr-box">
    <button type="button" title="Bold (Ctrl+B)"><span class="fr-sr-only">Bold</span></button>
    <button type="button" title="Unordered List"><span class="fr-sr-only">Unordered List</span></button>
    <a title="Default">Default</a><a title="Circle">Circle</a>
    <span class="fr-placeholder">How do you find the start? Obvious landmarks? AVOID relative directions such as 'Left of (route next to it)'! Optional but can be critical!</span>
    <span class="fr-counter">Characters : 27/10000</span>
  </div>`;

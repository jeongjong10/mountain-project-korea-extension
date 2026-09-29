/** Sanitized structure checked against owned Chrome /forum and /forum/103989405/general-climbing on 2026-09-29.
 * User names, topic titles, bodies, dates and IDs below are synthetic.
 * Form/editor cases model the auth-gated contract; no authenticated submission was inspected.
 */
export const forumHome = `
  <h1>Mountain Project Forums</h1>
  <a class="btn" href="/forum/latest">Latest Posts in all Forums</a>
  <table id="forum-table"><tbody>
    <tr><th>Gear</th><th>Last Post</th></tr>
    <tr><td><a href="/forum/103989417/climbing-gear-discussion">Climbing Gear Discussion</a>
      <div class="text-warm hidden-xs-down">Open discussions regarding climbing gear.</div>
      <div class="text-warm hidden-sm-up">Last Post: Sep 15, 2026</div></td>
      <td class="text-nowrap text-xs-right"><span>23 mins ago</span><a href="/user/1/example"><strong>General</strong></a></td></tr>
    <tr><td><a href="/forum/103989418/climbing-gear-reviews">Climbing Gear Reviews</a></td></tr>
    <tr><th>MountainProject.com - the site</th><th>Last Post</th></tr>
  </tbody></table>`;

export const forumListing = `
  <h1>General Climbing</h1>
  <a class="btn require-user" href="/add/forum-topic/103989405">Start New Topic</a>
  <ul class="pagination"><li><a class="no-click">1 of 412</a></li>
    <li><a href="/forum/103989405/general-climbing?page=2" title="Next Page">Next</a></li></ul>
  <table id="forum-table"><tbody><tr><th>Topic</th><th>Replies</th><th>Last Post</th></tr>
    <tr><td><a href="/forum/topic/123/example"><strong>General Climbing</strong></a>
      <span>— <a href="/user/1/example">Reply</a></span></td>
      <td>2</td><td><a href="/forum/message/456">Sep 15, 2026</a></td></tr>
  </tbody></table>`;

export const forumTopic = `
  <div id="topic-guts"><h1><span>Follow</span></h1>
    <a class="btn btn-primary btn-sm" href="#reply">Post Reply</a>
    <strong>Follow topic:</strong><label><input type="checkbox" name="follow" value="byEmail"> Email</label>
    <table id="forum-table"><tbody><tr class="message-row"><td>
      <div class="bio"><a href="/user/1/example">Reply</a><div class="text-warm">Joined Jan 2020 · Points: 42</div>
        <a class="permalink" href="/forum/message/456">Sep 15, 2026</a></div>
      <div class="fr-view"><p>Looking for a <strong>climbing partner</strong>.</p>
        <blockquote><cite>Reply wrote:</cite><p>Meet at the trail.</p></blockquote>
        <ul><li>Bring a rope.</li></ul><pre>path/to/file</pre>
        <a href="https://example.com/route">route details</a><div class="signature">General Climbing</div></div>
      <a class="require-user">Quote</a><a>Flag</a>
    </td></tr></tbody></table>
  </div>`;

export const forumForm = `
  <form action="/add/forum-topic/103989405" method="post">
    <input type="hidden" name="csrf" value="synthetic-token">
    <label>Topic Title<input name="title" value="General Climbing" placeholder="Topic title"></label>
    <label>Message<textarea name="message" placeholder="Write your message">Do not translate my draft.</textarea></label>
    <div class="fr-view" contenteditable="true"><p>General Climbing</p></div>
    <div contenteditable=""><p>General Climbing</p></div>
    <div contenteditable="plaintext-only">General Climbing</div>
    <label>Forum<select name="forum"><option value="103989405">General Climbing</option><option>General Climbing</option></select></label>
    <button type="button" name="action" value="preview">Preview</button>
    <input type="submit" name="action" value="Post New Topic">
  </form>`;

/** Auth-gated reply/edit form model. Values and authored formatting are synthetic. */
export const forumReplyForm = `
  <h1>Your Reply</h1>
  <form action="/add/forum-message/123" method="post">
    <input type="hidden" name="csrf" value="synthetic-token">
    <label>Message<textarea name="message" placeholder="Write your reply">Keep **this draft** exactly.\nGeneral Climbing</textarea></label>
    <div class="fr-view" contenteditable="true"><p>General <strong>Climbing</strong></p><pre>route/example</pre></div>
    <button type="button" name="action" value="preview">Preview</button>
    <button type="submit" name="action" value="reply">Post Reply</button>
    <a href="/forum/topic/123/example#reply">Cancel</a>
  </form>`;

export const forumEditForm = forumReplyForm
  .replace('action="/add/forum-message/123"', 'action="/edit/forum-message/456"')
  .replace('value="reply">Post Reply', 'value="save">Save');

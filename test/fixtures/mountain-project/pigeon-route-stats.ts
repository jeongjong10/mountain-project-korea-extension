// Source-informed stats DOM with generated fictional people and values.
// Factual Pigeon route identifiers remain interoperability examples, not current statistics.
const personRows = (prefix: string, count: number, withValue = true): string =>
  Array.from({ length: count }, (_, index) => `
    <tr id="${prefix}.${index + 1}">
      <td><a href="/user/${index + 1}">Person ${index + 1}</a></td>
      ${withValue ? `<td>Value ${index + 1}</td>` : ''}
    </tr>
  `).join('');

const statsColumn = (
  columnClass: string,
  heading: string,
  count: number,
  rows: string,
  showMore: boolean,
): string => `
  <div class="${columnClass} mt-2 max-height max-height-md-1000 max-height-xs-400">
    <div class="react-stats-section">
      <h3>${heading} <span class="small text-muted">${count}</span></h3>
      <table class="table table-striped"><tbody>${rows}</tbody></table>
      ${showMore ? `
        <div class="sc-more-gradient" style="position: absolute; height: 100px">
          <button type="button" style="position: relative">Show More</button>
        </div>
      ` : ''}
    </div>
  </div>
`;

export const PIGEON_ROUTE_STATS_FIXTURE = `
  <div id="route-stats">
    <div class="row pt-main-content">
      <div class="col-xs-12">
        <div class="mb-half small text-warm">
          <a href="/area/106225629/south-korea">S Korea</a> &gt;
          <a href="/route/127049143/pigeon">Pigeon(비둘기)</a>
        </div>
        <h1>Statistics for Pigeon(비둘기)</h1>
      </div>
    </div>
    <div class="onx-stats-table" data-props='{"routeId":"127049143","isAdmin":false}'>
      <div class="row">
        ${statsColumn(
          'col-lg-3 col-sm-4 col-xs-12',
          'Ticks',
          7,
          personRows('ticks', 7),
          true,
        )}
        ${statsColumn(
          'col-lg-2 col-sm-4 col-xs-12',
          'Suggested Ratings',
          1,
          personRows('ratings', 1),
          false,
        )}
        ${statsColumn(
          'col-lg-2 col-sm-4 col-xs-12',
          'Star Ratings',
          3,
          personRows('stars', 3),
          false,
        )}
        ${statsColumn(
          'col-lg-4 col-sm-8 col-xs-12',
          'On To-Do Lists',
          9,
          personRows('todos', 9, false),
          true,
        )}
      </div>
    </div>
  </div>
`;

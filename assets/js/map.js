/* JUICE — Interactive Juneteenth map
   Built on Leaflet with Carto Dark Matter tiles for a beautiful, themed look.
   No API key required — works on GitHub Pages out of the box.
   The map UI is Mapbox-style: dark canvas, custom markers, smooth fly-to.
*/

const STOPS = [
  {
    id: "philadelphia",
    date: "July 4, 1776",
    title: "The Promise Written Down",
    place: "Independence Hall · Philadelphia, PA",
    coords: [39.9489, -75.1500],
    body:
      "The Declaration of Independence proclaims that 'all men are created equal' — a truth its signers had not yet extended to the people they enslaved. Juneteenth is, in part, the long, unfinished work of cashing this check."
  },
  {
    id: "emancipation-prelim",
    date: "September 22, 1862",
    title: "The Preliminary Emancipation Proclamation",
    place: "The White House · Washington, DC",
    coords: [38.8977, -77.0365],
    body:
      "Lincoln issues a warning: any state still in rebellion on January 1, 1863 will see its enslaved people declared free. The proclamation is a war measure — and a moral pivot."
  },
  {
    id: "emancipation",
    date: "January 1, 1863",
    title: "The Emancipation Proclamation Takes Effect",
    place: "The White House · Washington, DC",
    coords: [38.8977, -77.0365],
    body:
      "On New Year's Day — known among the enslaved as 'Jubilee Day' — the proclamation goes into force. It frees no one whom Union forces cannot reach. Its meaning grows mile by mile, with each Union advance."
  },
  {
    id: "appomattox",
    date: "April 9, 1865",
    title: "Surrender at Appomattox",
    place: "Appomattox Court House, VA",
    coords: [37.3776, -78.7956],
    body:
      "Lee surrenders to Grant. The war effectively ends — but the news, and the freedom that follows it, still has hundreds of miles and weeks to travel before reaching every enslaved person."
  },
  {
    id: "galveston",
    date: "June 19, 1865",
    title: "Freedom Reaches Texas",
    place: "Ashton Villa · Galveston, TX",
    coords: [29.3013, -94.7977],
    body:
      "Maj. Gen. Gordon Granger arrives in Galveston with about 2,000 Union troops and reads General Order No. 3: 'The people of Texas are informed that, in accordance with a proclamation from the Executive of the United States, all slaves are free.' Some 250,000 people learn that day what had been legally true for two and a half years. This is Juneteenth."
  },
  {
    id: "reedy",
    date: "1866",
    title: "The First Annual Celebration",
    place: "Reedy Chapel AME · Galveston, TX",
    coords: [29.3060, -94.7929],
    body:
      "One year later, freedmen and freedwomen gather at Reedy Chapel for what becomes the first annual Juneteenth celebration: prayer, song, a public reading of the Emancipation Proclamation, and a community meal. The form set here would travel everywhere."
  },
  {
    id: "thirteenth",
    date: "December 6, 1865",
    title: "The 13th Amendment Ratified",
    place: "U.S. Capitol · Washington, DC",
    coords: [38.8899, -77.0091],
    body:
      "Slavery is abolished as a legal institution in the United States — except as punishment for a crime, a clause whose long shadow stretches into the present. The work of freedom is not finished; it is only newly begun."
  },
  {
    id: "emancipation-park",
    date: "1872",
    title: "Emancipation Park Purchased",
    place: "Emancipation Park · Houston, TX",
    coords: [29.7378, -95.3580],
    body:
      "Barred from white-owned parks, four formerly enslaved community leaders — Rev. Jack Yates, Richard Allen, Richard Brock, and Elias Dibble — pool $800 to buy ten acres for Juneteenth gatherings. The park stands today, in part because they refused to ask permission to be free."
  },
  {
    id: "march-on-washington",
    date: "August 28, 1963",
    title: "The March on Washington",
    place: "Lincoln Memorial · Washington, DC",
    coords: [38.8893, -77.0502],
    body:
      "More than 200,000 people gather to demand civil and economic rights. Dr. King speaks of a dream rooted in the same promise Juneteenth carries — that the dignity of every person is not earned, but recognized."
  },
  {
    id: "selma",
    date: "March 7, 1965",
    title: "Bloody Sunday on the Edmund Pettus Bridge",
    place: "Selma, AL",
    coords: [32.4045, -87.0181],
    body:
      "Six hundred peaceful marchers — among them a young John Lewis — are met with state violence on the bridge. Within months, the Voting Rights Act passes. The march from Galveston to full citizenship continues, on foot, across decades."
  },
  {
    id: "texas-recognition",
    date: "January 1, 1980",
    title: "Texas Recognizes Juneteenth",
    place: "State Capitol · Austin, TX",
    coords: [30.2747, -97.7404],
    body:
      "After a campaign led by State Rep. Al Edwards, Texas becomes the first state to recognize Juneteenth as an official holiday. The day that began in Galveston becomes a state-honored memory."
  },
  {
    id: "federal",
    date: "June 17, 2021",
    title: "Juneteenth Becomes a Federal Holiday",
    place: "The White House · Washington, DC",
    coords: [38.8977, -77.0365],
    body:
      "President Biden signs the Juneteenth National Independence Day Act, making Juneteenth the eleventh federal holiday — the first new one since Martin Luther King Jr. Day in 1983. Activist Opal Lee, the 'grandmother of Juneteenth,' stands beside him."
  },
  {
    id: "minnesota",
    date: "February 3, 2023",
    title: "Minnesota Recognizes Juneteenth",
    place: "Minnesota State Capitol · St. Paul, MN",
    coords: [44.9553, -93.1024],
    body:
      "Governor Tim Walz signs the bill making Juneteenth an official state holiday in Minnesota. It is the first new state holiday in Minnesota in nearly 40 years."
  },
  {
    id: "west-broadway",
    date: "June 19, 2026",
    title: "The MN Juneteenth Jamboree",
    place: "West Broadway Ave N · Minneapolis, MN",
    coords: [44.9966, -93.3008],
    body:
      "Three blocks. 5,000+ neighbors. Parade, carnival, food trucks, live music, farmers market, car show. Minnesota's largest Juneteenth celebration, presented by J.U.I.C.E. — and the next chapter of a story that began in Galveston in 1865."
  }
];

function popupHTML(s) {
  return `<time>${s.date}</time><h4>${s.title}</h4><p><strong>${s.place}</strong></p><p>${s.body}</p>`;
}

function init() {
  const map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: true,
    worldCopyJump: true,
    minZoom: 3
  }).setView([37.5, -90], 4);

  // Carto Dark Matter — beautiful dark vector-style raster tiles, free to use.
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19
    }
  ).addTo(map);

  const markers = {};
  const COLORS = ["#e3261c", "#f2b63c", "#2e7d32"];
  STOPS.forEach((s, i) => {
    const color = COLORS[i % COLORS.length];
    const icon = L.divIcon({
      className: "juice-pin",
      html: `<span style="
        display:block;width:18px;height:18px;border-radius:50%;
        background:${color};border:3px solid #f7eedd;
        box-shadow:0 0 0 2px ${color}, 0 4px 14px rgba(0,0,0,0.6);"></span>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    const m = L.marker(s.coords, { icon }).addTo(map);
    m.bindPopup(popupHTML(s), { maxWidth: 320 });
    markers[s.id] = m;
  });

  // Sidebar
  const list = document.querySelector(".stop-list");
  STOPS.forEach((s, i) => {
    const li = document.createElement("li");
    li.className = "stop";
    li.dataset.id = s.id;
    li.innerHTML = `<time>${s.date}</time><h4>${s.title}</h4><p>${s.place}</p>`;
    li.addEventListener("click", () => focusStop(s.id));
    list.appendChild(li);
  });

  function focusStop(id) {
    const s = STOPS.find(x => x.id === id);
    if (!s) return;
    document.querySelectorAll(".stop").forEach(el => el.classList.remove("active"));
    const li = document.querySelector(`.stop[data-id="${id}"]`);
    if (li) {
      li.classList.add("active");
      li.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    map.flyTo(s.coords, 7, { duration: 1.2 });
    setTimeout(() => markers[id].openPopup(), 800);
  }

  // Auto-open the first stop
  setTimeout(() => focusStop(STOPS[0].id), 400);

  // Expose for debugging / future hooks
  window.JUICE_MAP = { map, markers, STOPS, focusStop };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

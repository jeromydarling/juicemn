/* JUICE — Interactive Juneteenth map
   Map on top; horizontal swipable stop strip below.
   Built on Leaflet + Carto Dark Matter tiles (no API key required).
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
      "Maj. Gen. Gordon Granger arrives in Galveston with about 2,000 Union troops and reads General Order No. 3: 'all slaves are free.' Some 250,000 people learn that day what had been legally true for two and a half years. This is Juneteenth."
  },
  {
    id: "reedy",
    date: "1866",
    title: "The First Annual Celebration",
    place: "Reedy Chapel AME · Galveston, TX",
    coords: [29.3060, -94.7929],
    body:
      "One year later, freedmen and freedwomen gather at Reedy Chapel for the first annual Juneteenth celebration: prayer, song, a public reading of the Emancipation Proclamation, and a community meal. The form set here would travel everywhere."
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
      "Barred from white-owned parks, four formerly enslaved community leaders — Rev. Jack Yates, Richard Allen, Richard Brock, and Elias Dibble — pool $800 to buy ten acres for Juneteenth gatherings. The park stands today."
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
      "Six hundred peaceful marchers — among them a young John Lewis — are met with state violence on the bridge. Within months, the Voting Rights Act passes."
  },
  {
    id: "texas-recognition",
    date: "January 1, 1980",
    title: "Texas Recognizes Juneteenth",
    place: "State Capitol · Austin, TX",
    coords: [30.2747, -97.7404],
    body:
      "After a campaign led by State Rep. Al Edwards, Texas becomes the first state to recognize Juneteenth as an official holiday."
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
      "Governor Tim Walz signs the bill making Juneteenth an official state holiday in Minnesota — the first new state holiday in nearly 40 years."
  },
  {
    id: "west-broadway",
    date: "June 19, 2026",
    title: "The MN Juneteenth Jamboree",
    place: "West Broadway Ave N · Minneapolis, MN",
    coords: [44.9966, -93.3008],
    body:
      "Three blocks. 5,000+ neighbors. Parade, carnival, food trucks, live music, farmers market. Minnesota's largest Juneteenth celebration — and the next chapter of the story that began in Galveston."
  }
];

function popupHTML(s) {
  return (
    `<time>${s.date}</time>` +
    `<h4>${s.title}</h4>` +
    `<div class="place">${s.place}</div>` +
    `<p>${s.body}</p>`
  );
}

function init() {
  const map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: true,
    worldCopyJump: true,
    minZoom: 3
  });

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19
    }
  ).addTo(map);

  // Fit all stops into view, with generous padding so nothing's hugging the edge
  const bounds = L.latLngBounds(STOPS.map(s => s.coords));
  map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });

  // Markers
  const markers = {};
  const COLORS = ["#e3261c", "#f2b63c", "#2e7d32"];
  STOPS.forEach((s, i) => {
    const color = COLORS[i % COLORS.length];
    const icon = L.divIcon({
      className: "juice-pin",
      html: `<span style="
        display:block;width:16px;height:16px;border-radius:50%;
        background:${color};border:3px solid #f7eedd;
        box-shadow:0 0 0 2px ${color}, 0 4px 12px rgba(0,0,0,0.6);"></span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const m = L.marker(s.coords, { icon }).addTo(map);
    m.bindPopup(popupHTML(s), { maxWidth: 240, autoPanPadding: [30, 60] });
    m.on("click", () => setActive(s.id, { panMap: false }));
    markers[s.id] = m;
  });

  // Stop strip
  const strip = document.querySelector(".stop-strip");
  STOPS.forEach((s, i) => {
    const li = document.createElement("li");
    li.className = "stop-card";
    li.dataset.id = s.id;
    li.tabIndex = 0;
    const num = String(i + 1).padStart(2, "0");
    li.innerHTML =
      `<span class="num">${num} · ${STOPS.length}</span>` +
      `<time>${s.date}</time>` +
      `<h4>${s.title}</h4>` +
      `<p>${s.place}</p>`;
    li.addEventListener("click", () => setActive(s.id, { panMap: true }));
    li.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActive(s.id, { panMap: true });
      }
    });
    strip.appendChild(li);
  });

  let activeIndex = 0;

  function setActive(id, opts = {}) {
    const idx = STOPS.findIndex(x => x.id === id);
    if (idx < 0) return;
    activeIndex = idx;
    const s = STOPS[idx];

    document.querySelectorAll(".stop-card").forEach(el =>
      el.classList.toggle("active", el.dataset.id === id)
    );

    // Scroll the active card into view in the strip
    const card = document.querySelector(`.stop-card[data-id="${id}"]`);
    if (card) {
      card.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start"
      });
    }

    if (opts.panMap !== false) {
      map.flyTo(s.coords, 6, { duration: 0.9, easeLinearity: 0.3 });
      setTimeout(() => markers[id].openPopup(), 700);
    } else {
      markers[id].openPopup();
    }

    updateArrows();
  }

  // Arrow navigation
  const prevBtn = document.querySelector(".strip-arrow.prev");
  const nextBtn = document.querySelector(".strip-arrow.next");

  function updateArrows() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = activeIndex <= 0;
    nextBtn.disabled = activeIndex >= STOPS.length - 1;
  }

  prevBtn?.addEventListener("click", () => {
    if (activeIndex > 0) setActive(STOPS[activeIndex - 1].id, { panMap: true });
  });
  nextBtn?.addEventListener("click", () => {
    if (activeIndex < STOPS.length - 1) setActive(STOPS[activeIndex + 1].id, { panMap: true });
  });

  document.addEventListener("keydown", e => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === "ArrowLeft" && activeIndex > 0) setActive(STOPS[activeIndex - 1].id, { panMap: true });
    if (e.key === "ArrowRight" && activeIndex < STOPS.length - 1) setActive(STOPS[activeIndex + 1].id, { panMap: true });
  });

  // Initial: highlight first card without zooming in (keep the wide view)
  document.querySelector(`.stop-card[data-id="${STOPS[0].id}"]`)?.classList.add("active");
  updateArrows();

  // Make sure tiles render correctly after layout settles (mobile address bar etc.)
  setTimeout(() => map.invalidateSize(), 200);
  window.addEventListener("resize", () => map.invalidateSize());

  window.JUICE_MAP = { map, markers, STOPS, setActive };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

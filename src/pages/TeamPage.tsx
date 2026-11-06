import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import cherukuri from "../assets/teams/cherukuri.png";
import lavanya from "../assets/teams/lavanya.png";
import mahendra from "../assets/teams/mahendra.png";
import navdha from "../assets/teams/navdha.png";
import adheesh from "../assets/teams/adheesh.png";
import aarjav from "../assets/teams/aarjav.png";
import prakhar from "../assets/teams/prakhar.png";
import rohit from "../assets/teams/rohit.png";
import drashti from "../assets/teams/drashti.png";
import shaurya from "../assets/teams/shaurya.png";
import ishaan from "../assets/teams/ishaan.png";
import rishit from "../assets/teams/rishit.png";
import vansh from "../assets/teams/vansh.png";
import nishtha from "../assets/teams/nishtha.png";
import krishika from "../assets/teams/krishika.png";
import harshit from "../assets/teams/harshit.png";
import googleScholarIcon from "../assets/teams/Google-Scholar.png";
import githubIcon from "../assets/teams/github.png";
import linkedinIcon from "../assets/teams/linkedin.png";

import ProfileCard from "../components/ProfileCard";

gsap.registerPlugin(ScrollTrigger);

const imageMap = {
  cherukuri,
  lavanya,
  mahendra,
  navdha,
  adheesh,
  aarjav,
  prakhar,
  rohit,
  drashti,
  shaurya,
  ishaan,
  rishit,
  vansh,
  nishtha,
  krishika,
  harshit,
};

type ImageKey = keyof typeof imageMap;

type SocialLink = {
  href?: string;
  iconSrc: string;
  label: string;
};

type TeamMember = {
  name: string;
  role: string;
  imageSrc: ImageKey;
  row: number;
  primaryLink?: SocialLink;
  secondaryLink?: SocialLink;
};

const teamData: TeamMember[] = [
  {
    name: "Dr. Aswani Kumar Cherukuri",
    role: "Faculty Co-ordinator",
    imageSrc: "cherukuri",
    row: 1,
    primaryLink: {
      href: "https://scholar.google.com/citations?user=8vttwsYAAAAJ&hl=en",
      iconSrc: googleScholarIcon,
      label: "Google Scholar",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/cherukuri9/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Lavanya Jain",
    role: "ACM-W Chairperson",
    imageSrc: "lavanya",
    row: 2,
    primaryLink: {
      href: "https://github.com/lavanyajain14",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/lavanya-jain-556839287/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Mahendra Choudhary",
    role: "ACM-W Vice Chairperson",
    imageSrc: "mahendra",
    row: 2,
    primaryLink: {
      href: "https://github.com/mahendra785",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/mahendra-choudhary-a919002b8/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Navdha Sharma",
    role: "ACM-W Secretary",
    imageSrc: "navdha",
    row: 2,
    primaryLink: {
      href: "https://github.com/NavdhaSharma02",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/navdha-sharma-0217bb28a/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Adheesh Garg",
    role: "ACM-W Technical Director",
    imageSrc: "adheesh",
    row: 3,
    primaryLink: {
      href: "https://github.com/qwerty-dvorak",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/adheesh-garg-409482229/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Aarjav Jain",
    role: "ACM-W Design Lead",
    imageSrc: "aarjav",
    row: 3,
    primaryLink: {
      href: "https://github.com/BharatwaleJain",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/bharatwalejain/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Prakhar Joshi",
    role: "ACM Chairperson",
    imageSrc: "prakhar",
    row: 4,
    primaryLink: {
      href: "https://github.com/pj4real",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/prakharjoshi23/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Rohit Sakamuri",
    role: "ACM Vice Chairperson",
    imageSrc: "rohit",
    row: 4,
    primaryLink: {
      href: "https://github.com/RohitPhaniramSakamuri",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/rohit-sakamuri-563878215/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Drashti Shukla",
    role: "ACM Secretary",
    imageSrc: "drashti",
    row: 5,
    primaryLink: {
      href: "https://github.com/drashtishukla",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/drashtishukla/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Shaurya Garg",
    role: "ACM Co-Secretary",
    imageSrc: "shaurya",
    row: 5,
    primaryLink: {
      href: "https://github.com/ShauryaGarg17",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/shauryagarg11/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Ishaan Samdani",
    role: "ACM Technical Director",
    imageSrc: "ishaan",
    row: 5,
    primaryLink: {
      href: "https://github.com/theg1239",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/ishaaans/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Rishit Shivam",
    role: "ACM Research Lead",
    imageSrc: "rishit",
    row: 6,
    primaryLink: {
      href: "https://github.com/pokymono",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/rishitshivam/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Vansh Dhir",
    role: "ACM Projects Lead",
    imageSrc: "vansh",
    row: 6,
    primaryLink: {
      href: "https://github.com/Van5sh",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/vansh-dhir-686b5028b/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Nishtha Aggarwal",
    role: "ACM Design Lead",
    imageSrc: "nishtha",
    row: 6,
    primaryLink: {
      href: "https://github.com/nishthaaggarwal24",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/nishtha-aggarwal-a7623426b/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Krishika Sureka",
    role: "ACM Creative Lead",
    imageSrc: "krishika",
    row: 7,
    primaryLink: {
      href: "https://github.com/Krishika09",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/krishikasureka/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Harshit Narang",
    role: "ACM Competitions Lead",
    imageSrc: "harshit",
    row: 7,
    primaryLink: {
      href: "https://github.com/harshitnarang28",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/harshitnarang28/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
];

export default function TeamPage() {
  const sectionRef = useRef<HTMLElement>(null);

  const rows = useMemo(() => {
    const rowSet = new Set(teamData.map((member) => member.row));
    return Array.from(rowSet).sort((a, b) => a - b);
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const media = gsap.matchMedia(section);
    media.add({
      motion: "(prefers-reduced-motion: no-preference)",
      wide: "(min-width: 48rem)",
    }, ({ conditions }) => {
      if (!conditions?.motion) return;

      const { wide } = conditions;
      const groups = section.querySelectorAll(wide ? "[data-team-row]" : "[data-team-slot]");
      // Keep the scattered poses stable when scrolling back or resizing.
      const entries = [
        { side: -.83, depth: .72, tilt: -6, start: .04, end: .90 },
        { side: .96, depth: .48, tilt: 7, start: 0, end: .78 },
        { side: -.37, depth: 1, tilt: 4, start: .14, end: 1 },
        { side: .58, depth: .83, tilt: -5, start: .09, end: .96 },
        { side: -1, depth: .60, tilt: 5, start: .03, end: .85 },
        { side: .24, depth: .92, tilt: -3, start: .18, end: 1 },
        { side: .75, depth: .65, tilt: 6, start: .07, end: .91 },
      ];
      let cardIndex = 0;
      groups.forEach((group) => {
        const cards = group.querySelectorAll(".team-card");
        const rise = gsap.timeline({
          defaults: { ease: "sine.inOut" },
          scrollTrigger: {
            trigger: group,
            start: "top 112%",
            end: wide ? "top 31%" : "top 42%",
            scrub: 0.48,
            invalidateOnRefresh: true,
          },
        });

        rise.to({}, { duration: 1 }, 0);
        cards.forEach((card) => {
          const { side, depth, tilt, start, end } = entries[cardIndex++ % entries.length];
          const duration = end - start;
          // Horizontal drift settles first, letting each print rise along a soft curve.
          rise.fromTo(card, {
            y: () => depth * Math.min(window.innerHeight * (wide ? .29 : .18), wide ? 210 : 125),
            rotation: tilt * (wide ? 1 : .65),
          }, {
            y: 0,
            rotation: 0,
            duration,
          }, start)
            .fromTo(card, {
              x: () => side * Math.min(window.innerWidth * (wide ? .085 : .055), wide ? 110 : 24),
            }, { x: 0, duration: duration * .86, ease: "sine.out" }, start);
        });
      });
    });

    return () => media.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-visible bg-[#B49880] py-16 text-[#580A0A] sm:py-20"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6">
        <div className="mt-12 flex w-full flex-col gap-10">
          {rows.map((row) => {
            const rowMembers = teamData.filter(
              (member) => member.row === row,
            );

            return (
              <div
                key={row}
                id={row === 1 ? "faculty-coordinator" : undefined}
                data-team-row
                className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-8"
              >
                {rowMembers.map((member) => (
                  <div
                    key={member.name}
                    data-team-slot
                    className="min-w-0 w-[min(92vw,26.25rem)] sm:w-[min(42vw,26.25rem)]"
                  >
                    <ProfileCard
                      name={member.name}
                      role={member.role}
                      imageSrc={imageMap[member.imageSrc]}
                      primaryLink={member.primaryLink}
                      secondaryLink={member.secondaryLink}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

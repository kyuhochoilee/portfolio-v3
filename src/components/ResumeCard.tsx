import { FileText, ExternalLink } from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";

interface ResumeItemProps {
  logo?: string;
  organization: string;
  title?: string;
  dates?: string;
  link?: string;
  current?: boolean /* show pulsing indicator if true */;
}

const ResumeItem = ({
  logo,
  organization,
  title,
  dates,
  link,
  current = false,
}: ResumeItemProps) => (
  <li className="flex flex-col gap-2 items-start w-full">
    {link ? (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-row items-center justify-between gap-2 w-full p-2 -m-2 rounded-md transition hover:bg-gray-100"
      >
        <div className="flex flex-row items-center">
          {logo && (
            <img
              src={logo}
              alt={`${organization} logo`}
              className="w-9 h-9 rounded-md border border-gray-200 shadow-sm mr-3"
            />
          )}

          <div className="flex flex-col ">
            <span className="text-sm text-gray-800 font-medium leading-tight flex items-center gap-2">
              {organization}
              {current && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
              )}
            </span>
            {dates && <div className="text-xs text-gray-400">{dates}</div>}
          </div>
        </div>

        {title && <div className="text-sm text-gray-500">{title}</div>}
        <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
      </a>
    ) : (
      <div className="flex flex-row items-center justify-between w-full gap-2">
        <div className="flex items-center">
          {logo && (
            <img
              src={logo}
              alt={`${organization} logo`}
              className="w-8 h-8 rounded-md border border-gray-200 shadow-sm mr-2"
            />
          )}
          <div className="flex flex-col ">
            <span className="text-gray-800 font-medium leading-tight flex items-center gap-2">
              {organization}
              {current && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
              )}
            </span>
            {dates && <div className="text-xs text-gray-400">{dates}</div>}
          </div>
        </div>

        {title && <div className="text-sm text-gray-500">{title}</div>}
        <ExternalLink className="w-4 h-4 text-gray-300 opacity-0 pointer-events-none" />
      </div>
    )}
  </li>
);

const ResumeCard = () => {
  return (
    <div className="flex-1 w-full card-glass p-5 pr-1 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-600 tracking-tight leading-relaxed mb-2">
          Experience
        </h2>
        <a
          href="/KyuhoLee_Resume.pdf"
          download
          className="group relative flex items-center justify-end gap-1.5 text-gray-400  hover:text-gray-500 rounded-lg hover:bg-gray-100 p-1 pl-2 mr-4 transition"
        >
          <span className="text-xs text-gray-500 hidden group-hover:block text-right">
            Get&nbsp;Resume
          </span>

          <FileText className="w-4 h-4" />
        </a>
      </div>

      <div className="mb-4">
        {/* <div className="h-px mt-2 mb-4 bg-gradient-to-r from-gray-300 to-transparent" /> */}

        <ul className="list-none list-inside text-gray-600 space-y-5">
          <ResumeItem
            logo="/logo-clique.png"
            organization="Founder"
            // title="Social shared albums."
            dates="Clique · August 2024 - Present"
            link="https://cliqueapp.org"
            current
          />
          <ResumeItem
            logo="/logo-speak.jpeg"
            organization="Design Engineer, Product Designer"
            // title="AI-powered language learning. Backed by OpenAI, Y Combinator, Founders Fund, Accel, Khosla, and others."
            dates="Speak (OpenAI) · June 2024 - February 2025"
            link="https://speak.com"
          />
          <ResumeItem
            logo="/logo-district.png"
            organization="Growth"
            // title="Social online marketplaces. Founded by Snap alum, backed by a16z and others."
            dates="District (a16z) · Summer 2024"
            link="https://district.net"
          />
          <ResumeItem
            logo="/logo-dyneti.png"
            organization="Marketing & Business Development"
            // title="Making online payments secure and effortless. Backed by Y Combinator, Shasta Ventures, Ashton Kutcher, among others."
            dates="Dyneti (YC W19) · Summer 2023"
            link="https://dyneti.com"
          />
          <ResumeItem
            logo="/logo-isteam.png"
            organization="Brand Designer, Web Developer"
            // title="501(c)(3) non-profit that provides free robotics classes to children with special needs."
            dates="iSTEAM Academy · October 2022 - July 2023"
            link="https://isteamacademy.org"
          />
          <div className="h-px mt-4 mb-4 bg-gradient-to-r from-gray-300 to-transparent" />

          <ResumeItem
            logo="/logo-penn.png"
            organization="University of Pennsylvania"
            dates="Class of 2025 · B.A. Design, Minors in CS & Psych"
            link="https://upenn.edu"
          />
          <ResumeItem
            logo="/logo-cssp.jpg"
            organization="Community School Student Partnerships"
            dates="Co Director · September 2021 - January 2025"
            link="https://web.sas.upenn.edu/penn-cssp/"
          />
          <ResumeItem
            logo="/logo-keynotes.png"
            organization="Keynotes A Cappella"
            dates="President · September 2021 - January 2025"
            link="https://pennkeynotes.com"
          />
        </ul>
      </div>
      <div className="flex gap-4 mt-auto pt-4">
        <a
          href="https://github.com/kyuhochoilee"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub className="w-5 h-5 text-gray-400 hover:text-gray-500 transition-opacity" />
        </a>
        <a
          href="https://linkedin.com/in/kyuholee0"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin className="w-5 h-5 text-gray-400 hover:text-gray-500 transition-opacity" />
        </a>
        <a
          href="https://read.cv/kyuho"
          target="_blank"
          rel="noopener noreferrer"
        ></a>
      </div>
    </div>
  );
};

export default ResumeCard;

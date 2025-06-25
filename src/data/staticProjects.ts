import { ProjectSummary, ProjectDetail } from "@/lib/notion";

/**
 * 1) Minimal grid data – `ProjectSummary[]`
 */
export const staticProjects: ProjectSummary[] = [
  {
    id: "clique",
    name: "Clique",
    slug: "clique",
    description: "Social shared albums.",
    featuredImage: "/images/cover-clique.mp4",
    headerImage: "/images/header-clique.jpg",
    tags: ["Product Design", "Code", "Brand"],
    link: "https://cliqueapp.org",
    role: "Founder",
    tools: ["Figma", "SwiftUI"],
    timeline: "Fall 2024 -  Present",
    published: true,
  },
  {
    id: "speak",
    name: "Speak",
    slug: "speak",
    description: "Revolutionizing language learning using AI.",
    featuredImage: "/images/cover-speak.mp4",
    headerImage: "/images/header-speak.jpg",
    tags: ["Product Design", "Code"],
    link: "https://speak.com",
    role: "Design Engineer",
    tools: ["Figma", "SwiftUI"],
    timeline: "June 2024 - February 2025",
    published: true,
  },
  {
    id: "thoughts",
    name: "Thoughts",
    slug: "thoughts",
    description: "The anti-social media app.",
    featuredImage: "/images/cover-thoughts.mp4",
    headerImage: "/images/header-thoughts.jpg",
    tags: ["Product Design", "Code"],
    link: "https://www.figma.com/design/rgXee8qRWlo9k047ph5jor/Thoughts-UI-Kit?node-id=681-699&t=fV1TjvucgRx4dahY-1",
    role: "Designer, Developer",
    tools: ["Figma", "React Native"],
    timeline: "Summer 2023",
    published: true,
  },
  {
    id: "paradigm",
    name: "Paradigm Case Study",
    slug: "paradigm",
    description: "Reimagining their file organization.",
    featuredImage: "/images/cover-paradigm.jpg",
    headerImage: "/images/header-paradigm.jpg",
    tags: ["Product Design"],
    link: "https://www.figma.com/design/etcKzyxy73ATdMTWZI7TRI/Kyuho-Lee-%E2%80%94-Paradigm-Redesign?node-id=0-1&t=C2zoLFkbUfarFl0d-1",
    role: "Designer",
    tools: ["Figma"],
    timeline: "1 day project — Spring 2025",
    published: true,
  },
  {
    id: "keynotes",
    name: "Keynotes",
    slug: "keynotes",
    description: "How a cappella became my creative playground...",
    featuredImage: "/images/cover-keynotes.jpg",
    headerImage: "/images/header-keynotes.jpg",
    tags: ["Creative", "Brand"],
    link: "https://pennkeynotes.com",
    role: "Creative Director",
    tools: ["Photoshop", "InDesign"],
    timeline: "Fall 2021 - Spring 2025",
    published: true,
  },

  {
    id: "isteam",
    name: "iSTEAM Academy",
    slug: "isteam",
    description: "Making robotics education accessible to all.",
    featuredImage: "/images/cover-isteam.jpg",
    headerImage: "/images/header-isteam.jpg",
    tags: ["Product Design", "Brand"],
    link: "https://www.isteamacademy.org/",
    role: "Designer, Developer",
    tools: ["Illustrator", "Photoshop", "Wix"],
    timeline: "Summer 2023",
    published: true,
  },
  {
    id: "nothing",
    name: "NOTHING IS EVER WRONG",
    slug: "nothing",
    description: "Building a world with music & design.",
    featuredImage: "/images/cover-nothing.jpg",
    headerImage: "/images/header-nothing.jpg",
    tags: ["Creative"],
    link: "https://untitled.stream/library/project/0StB2pIcEoimsmPdTLwfQ",
    role: "Artist",
    tools: ["Photoshop", "FL Studio"],
    timeline: "Fall 2024 - Spring 2025",
    published: true,
  },

  {
    id: "zine",
    name: "My Creative Projects",
    slug: "zine",
    description: "Creative explorations through coursework.",
    featuredImage: "/images/cover-zine.jpg",
    headerImage: "/images/header-zine.jpg",
    tags: ["Creative"],
    link: "https://www.youtube.com/watch?v=B_Mb7zgZsHg",
    role: "Artist",
    tools: ["Adobe Suite"],
    timeline: "Spring 2023 - Spring 2025",
    published: true,
  },
  // …more
];

/**
 * 2) Detail pages – key by slug
 *    You can paste **HTML, Markdown, or even the raw `recordMap`
 *    (see step 4)**
 */
export const staticProjectDetails: Record<string, ProjectDetail> = {
  nothing: {
    ...staticProjects.find((p) => p.slug === "nothing")!,
    pageContent: {
      type: "static",
      html: `
        <p><Image fill src="/images/nothing/film.jpeg" alt="Image" /></p>
<h1 id="about-the-project">About the Project</h1>
<p>This album represents the most complete expression of my artistic work so far. As part of my senior thesis at the University of Pennsylvania, I challenged myself to finish a full album—not just the songs, but the entire visual and design experience that surrounds it. The process was both demanding and rewarding, and pushed me to grow in ways I didn’t expect.</p>
<p><img src="/images/nothing/cover.jpeg" alt="Image"></p>
<p><img src="/images/nothing/cover-back.jpeg" alt="Image"></p>
<p><img src="/images/nothing/long-front.png" alt="Image"></p>
<p><img src="/images/nothing/long-back.png" alt="Image"></p>
<p><img src="/images/nothing/matchbox-exhibit.JPG" alt="Image"></p>
<p><img src="/images/nothing/matchbox-close.JPG" alt="Image"></p>
<p><img src="/images/nothing/matchbox-poems.jpg" alt="Image"></p>
<p><img src="/images/nothing/matchbox-flick.JPG" alt="Image"></p>
<p><img src="/images/nothing/matchbox-hand.JPG" alt="Image"></p>
<p><img src="/images/nothing/fortuneteller.jpg" alt="Image"></p>
        `,
    },
  },
  keynotes: {
    ...staticProjects.find((p) => p.slug === "keynotes")!,
    pageContent: {
      type: "static",
      html: `
        <p><img src="/images/keynotes/kyuho.jpg" alt="Image"></p>
<h1 id="project-overview">Project Overview</h1>
<p>Every semester, my college a cappella group holds a concert. For each of the 8 concerts I performed in, I led the creative direction of our promotional material. It became a semesterly challenge to develop a distinct brand and show experience, and a great way to grow my creative abilities every semester.</p>
<p><img src="/images/cover-keynotes.jpg" alt="Image"></p>
<h1 id="work-samples">Work Samples</h1>
<p>For each show, there needed to be a theme, a name, a photoshoot, graphic design guidelines, and a printed program. Below are some of my favorites from over the years — and feel free to visit the website I created, <a href="https://pennkeynotes.com/media">pennkeynotes.com/media</a>, for even more work samples!</p>
<p><img src="/images/keynotes/after-poster.jpg" alt="After Poster"></p>
<p><img src="/images/keynotes/after-aliyah.png" alt="After Aliyah"></p>
<p><img src="/images/keynotes/rec-poster.png" alt="Rec Poster"></p>
<p><img src="/images/keynotes/rec-prog.png" alt="Rec Prog"></p>
<p><img src="/images/keynotes/rec-kyu.png" alt="Rec Kyu"></p>
<p><img src="/images/keynotes/face-prog.png" alt="Face Prog"></p>
<p><img src="/images/keynotes/face-jason.png" alt="Face Jason"></p>
<p><img src="/images/keynotes/sols-poster.png" alt="Sols Poster"></p>
<p><img src="/images/keynotes/sols-prog.png" alt="Sols Prog"></p>
<p><img src="/images/keynotes/sols-mic.png" alt="Sols Mic"></p>
<p><img src="/images/keynotes/fin-poster.png" alt="Fin Poster"></p>
<p><img src="/images/keynotes/fin-prog.png" alt="Fin Prog"></p>
<p><img src="/images/keynotes/fin-brandon.png" alt="Fin Brandon"></p>
<p><img src="/images/keynotes/wes-poster.png" alt="Wes Poster"></p>
<p><img src="/images/keynotes/wes-prog.png" alt="Wes Prog"></p>
<p><img src="/images/keynotes/wes-vaness.png" alt="Wes Vaness"></p>
<h1 id="website">Website</h1>
<p>I also made the website: <a href="https://pennkeynotes.com/">pennkeynotes.com</a>. It&#39;s pretty cool, go check it out! There you can see the full documentation of my work (any design stuff you see there starting from 2022 is mine)...</p>
<p><img src="/images/keynotes/web-1.png" alt="Web"></p>
<p><img src="/images/keynotes/web-2.png" alt="Web"></p>
<p><img src="/images/keynotes/web-3.png" alt="Web"></p>

        `,
    },
  },

  thoughts: {
    ...staticProjects.find((p) => p.slug === "thoughts")!,
    pageContent: {
      type: "static",
      html: `
      <p><img src="/images/cover-thoughts.jpg" alt="Image 1"></p>
<h1 id="about-the-project">About the Project</h1>
<p>I’ve always been a huge fan of journaling. However, when I started college, my life started getting extra busy and cluttered, and I found journaling to be a great way to gather my thoughts and reset at the end of each day. I tried a bunch of different ways of journaling; physical journals, different apps, but found that none of them quite worked for me. So, when my internship ended this past summer, I brought an idea of a journaling app to a friend and together, we created Thoughts.</p>
<h1 id="project-overview">Project Overview</h1>
<p>At its core, Thoughts is the anti-social media app. I chose a social media style for my UI, complete with a feed and post creation page, but the app intentionally has no online functionality — everything that users write within the app stays strictly on their phone. There is functionality for photo uploads, mood tracking, entry organization and search, and Spotify integration which allows you to pick a song of the week. Having never done mobile development, this project definitely required a ton of research and iteration.</p>
<p><img src="/images/thoughts/2.png" alt="Image 2"></p>
<h1 id="the-problem">The Problem</h1>
<p>I never had the energy to actually write out my thoughts (and my handwriting is bad), so any time I tried to use a physical journal, it would fizzle out within a few days. I tried journaling apps, but I found them to be too formal and super clunky; I just didn’t want to use their apps. I did enjoy using private social media accounts, like Twitter and Instagram, because they were built for bite-sized content creation and I could create my own “aesthetic” within my feed. However, eventually I grew tired of how hard each account pushed me to try and consume content within the app; something I was not looking for in a journaling app. After years of experimenting with all of these different forms of journaling, I realized: why not make my own?</p>
<p><img src="/images/thoughts/3.png" alt="Image 3"></p>
<h1 id="the-research">The Research</h1>
<p>I carried out two main forms of research before beginning the app. The first was a simple survey which I sent out to friends and family. Through this survey, I uncovered a lot of interesting information that helped me get a good idea of what people were looking for. Unfortunately, my data set was not too large, due to various limitations, so the vast majority of people surveyed were students or young professionals. Above is the overview of the data. Next, I looked at current competitors in the market, and observed their UI, which I took inspiration from during the development of my wireframes.</p>
<p><img src="/images/thoughts/4.png" alt="Image 4"></p>
<h1 id="the-solution">The Solution</h1>
<p>To align with all of these features and preferences, I developed a solution: a journal app in the form of social media. I loved the aspects of an Instagram and Twitter account where I could just open up the app spontaneously and just post whatever was on my mind. I also loved how I could curate my own feed to look and feel how I wanted it to. People also loved how these apps could add photos, and some had voice memos and music integration. Finally, journaling apps had great ways of organizing and searching through their entries. Thoughts had developed from a rough idea to the implementation of favorite features of journaling apps within a simple, accessible app.</p>
<p><img src="/images/thoughts/5.png" alt="Image 5"></p>
<h1 id="design">Design</h1>
<p>Based on the information that I gathered from my research, I went in and started wireframing, beginning with rough sketches and low fidelity prototypes, getting feeedback, and then creating a high fidelity prototype that was ready to be developed. At each stage, I seeked and gained valuable feedback from potential users, which helped me streamline my work.</p>
<p><img src="/images/thoughts/6.png" alt="Image 6"></p>
<h1 id="development">Development</h1>
<p>Once I had a final design, I went to my friend and together we started working on the actual app. We chose React Native, and used the Expo Go platform to test our app. I took charge of the front end of the app, making sure that all user-facing features were both functional and visually appealing. Meanwhile, my friend worked on the back end of the app, ensuring that it was working at top efficiency, while maintaining data security. Both of these processes had unprecedented challenges, since neither of us had worked with React Native before, which extended our estimated time of completion. However, we were able to successfully create a working prototype by the end of our month working on it, which I am pretty proud of.</p>
<p><img src="/images/thoughts/7.png" alt="Image 7"></p>
<h1 id="final-product">Final Product</h1>
<p>The app itself is fairly simple. There are three main screens - the first being the home, where all your journal entries are organized chronologically, similar to a social media feed. The header image at the top of your feed is randomized after a certain amount of time, and you have a button to log an entry, or what we call a “Thought”, straight from the get go. Each Thought is like a post, where you can see your title and first line of your post, top image, your mood, and your song, if you added one. If you click into the Thought, you can read the rest of the post, and edit or delete.</p>
<p><img src="/images/thoughts/8.png" alt="Image 8"></p>
<h1 id="create-screen">Create Screen</h1>
<p>The create screen is also quite simple - it gets right to the point. You can enter any information in any of the fields. The mood picker and Spotify song selector was a key part of this design, as I wanted maximum personalization. By logging into your Spotify, we will suggest your most recently played songs, and then from there you can search a song that you would rather have. If you have Spotify open on your phone, you’re able to control it from Thoughts, and actually play the song if you’d like (this might only be available for Spotify Premium). We want to expand this to other music platforms too, but for now, since the majority of people I know use Spotify, we started with that. As an extra note, you just have to have one thing filled out for the thought to be logged. That way you can have the flexibility of using the journal for a variety of things. I wanted to implement the voice memos, but we ran into some technical issues, so hopefully that feature comes soon.</p>
<p><img src="/images/thoughts/9.png" alt="Image 9"></p>
<h1 id="profile-screen">Profile Screen</h1>
<p>The profile screen is where you can view your “profile”, as well as your posts in a more organized fashion. The profile, though not visible to anyone else, allows you to really make the app yours. You can add a profile picture, bio, just like a social media account. If you want to look back at old posts, we provided a calendar for you to find them quickly, and it indicates which dates have Thoughts. We also added a search function, and light and dark mode. And that’s pretty much it! As of right now, the app is fully functional and super fun to use.</p>
<p><img src="/images/thoughts/10.png" alt="Image 10"></p>
<h1 id="reflect">Reflect</h1>
<p>I absolutely loved making this app. It was super fun and interesting from the start to finish, and there were a ton of challenges and problems that I didn’t foresee, which pushed my skills as a designer and developer. I learned much more about how to use Figma effectively, React Native coding, and the design + engineering process from the start to finish. Being a personal project that I did with my best friend, it was really cool watching an idea turn into a real thing through our own hard work. With that being said, here were a few takeaways:</p>
<p><strong>Iterate, test, iterate, test, iterate! </strong>The UX testing aspect of this project was certainly the most educational. Getting opinions from non users gave me much more clarity in the direction that I wanted to take this app, and helped in formulating its present form. Having been one of the first mobile apps that I have designed, it was certainly a challenge, but getting feedback certainly helped a ton. And though it is something that is so stressed in design classes, it did feel different experiencing it first hand.</p>
<p><strong>The hardest part is the last 10%. </strong>
As we closed in towards the end of development (or so we thought), we realized that the final details were the hardest to smooth over. As a team of two with limited resources, we found ourselves dedicating much more time than we expected to solving these final issues, and we ultimately ran out of time (we had to go back to school). Thus, if I were to do another personal project, I would reconsider the scope and time frame of it to make sure it is realistic and more achievable.</p>
`,
    },
  },

  isteam: {
    ...staticProjects.find((p) => p.slug === "isteam")!,
    pageContent: {
      type: "static",
      html: `
        <p><img src="/images/cover-isteam.jpg" alt="Image"></p>
<h1 id="about-isteam-academy">About iSTEAM Academy</h1>
<p>Back in October 2022, I joined Vinci Robotics Academy, a local organization that offered STEM classes for kids, as a web developer. After I created a new website for Vinci, I was asked to lead the branding and strategy for their non-profit project, iSTEAM Academy. iSTEAM Academy is a registered 501(c)(3) nonprofit organization that offers free robotics classes for students with special needs in the Boston area. Their mission resonated strongly with me, so I happily took on the project, and this is the result! This was certainly one of my most educational and fulfilling experiences, and I’m proud to say that my work has had a direct positive impact on the organization, as well as the communities that have supported me throughout my life.</p>
<h1 id="project-overview">Project Overview</h1>
<p>My role was to lead the branding and strategy of iSTEAM as they pivoted from being a section of Vinci Robotics to its own non-profit organization. I first conducted initial interviews of current parents and students, as well as design critiques of similar organizations, to get a better idea of what iSTEAM’s branding should communicate. I then translated these insights into designing iSTEAM’s logo, brand language, and website.</p>
<p><img src="/images/isteam/vincipics.png" alt="Image"></p>
<h1 id="the-research">The Research</h1>
<p>Due to the scope of the project, as well as its community-oriented focus, I felt as though a qualitative approach to data collection would be better for iSTEAM. So, I started this project by talking to the board members of Vinci, as well as current staff and students that were running the first iteration of the non-profit. I asked them about their experiences with the program, as well as the motives behind their work. Throughout my conversations, I found that there was a common understanding and passion for inclusivity, collaboration, and learning across all of the people I interviewed. This, along with the classes that I was able to sit in on, showed to me that the main brand values that iSTEAM held were that it was a down-to-earth place for support, positivity, and growth.</p>
<p><img src="/images/isteam/isteamdesigncrit.png" alt="Image"></p>
<h1 id="design-critiques">Design Critiques</h1>
<p>To confirm these ideas, I wanted to interview parents of the children who were taking the classes, but unfortunately I was unable to get a hold of any of them, since there were not that many students at the time. This is definitely a big gap that I wish I was able to account for, but was unable to with the time and resources I was given. However, to compensate for this lack of research, I decided to go online and look for successful organizations that did similar work, to get a better understanding of the visuals and the language that I should be using with iSTEAM.</p>
<p><img src="/images/isteam/isteamlogo.png" alt="Image"></p>
<h1 id="the-brand">The Brand</h1>
<p>I wanted to make something that was clear and simple. I didn’t want to overcomplicate or modernize the logo, since at its core, iSTEAM was simply a passionate group of students and professionals who wanted to give back to children with special needs in the local community.</p>
<p><img src="/images/isteam/isteamsticker.png" alt="Image"></p>
<h1 id="behind-the-logo">Behind the Logo</h1>
<p>I went with a gear in the shape of a lightbulb to represent the STEM aspect in it, while emphasizing the idea of creativity and positivity. The fonts I chose for the iSTEAM Academy text was more lighthearted, and aimed to show how the organization was oriented towards children.</p>
<p><img src="/images/isteam/isteamscreens.png" alt="Image"></p>
<h1 id="the-website">The Website</h1>
<p>Having already created a website for Vinci before, I had some experience going into this one. However, this time, I was able to start this website from scratch. I based the structure of the site on my prior research of similar websites, but aimed to maintain the light-hearted, yet professional feeling of iSTEAM’s branding throughout the entire website. I was also responsible for writing up most of the content on the page, so I tried my best to create a brand voice that was consistent across pages.</p>
<p><img src="/images/isteam/isteamscreens2.png" alt="Image"></p>
<h1 id="final-thoughts">Final Thoughts</h1>
<p>Overall, I’m really happy about how this project turned out. iSTEAM is now finishing up its first full year as a registered non-profit! Being able to use my design skills to actively support the my hometown community is incredibly fulfilling and fun. The link to the website is at the top of this page, so feel free to check it out!</p>
      `,
    },
  },
  zine: {
    ...staticProjects.find((p) => p.slug === "zine")!,
    pageContent: {
      type: "static",
      html: `
 <h1 id="about">About</h1>
<p>Below is an assortment of creative work of mine that was developed through my coursework, or simply as a passion project. Enjoy!</p>
<p><img src="/images/creative/zine.jpeg"        alt="Zine"        style="border:0;" /></p>
<p><img src="/images/creative/posters.jpeg"     alt="Posters"     style="border:0;" /></p>
<p><img src="/images/creative/photo-self.jpg"  alt="Photo Self"  style="border:0;" /></p>
<p><img src="/images/creative/photo-s.jpeg"    alt="Photo S"     style="border:0;" /></p>
<p><img src="/images/creative/photo-a.jpeg"    alt="Photo A"     style="border:0;" /></p>
<p><img src="/images/creative/photo-c.jpeg"    alt="Photo C"     style="border:0;" /></p>
<p><img src="/images/creative/photo-n.jpeg"    alt="Photo N"     style="border:0;" /></p>
`,
    },
  },
  paradigm: {
    ...staticProjects.find((p) => p.slug === "paradigm")!,
    pageContent: {
      type: "static",
      html: `
<p><img src="/images/paradigm/paradigm.jpg" alt="Paradigm"></p>
<h1 id="about-the-project">About the Case Study</h1>
<p>Paradigm is a startup founded by Penn alum revolutionizing the spreadsheet using AI agents. I redesigned the entire interface to breathe — widening the sidebar, freshening the buttons, and introducing a full-fledged Workspace file manager with Starred, Shared with Me, and Files. A streamlined Recents preview, collapsible Home sections, color-coded folders, editable sheet icons, and a quick grid/list toggle make organizing and navigating dramatically faster while keeping the UI clean. Below are a few key screens; to explore the full case study, view the complete project here → <a href="https://www.figma.com/design/etcKzyxy73ATdMTWZI7TRI/Kyuho-Lee-%E2%80%94-Paradigm-Redesign?node-id=0-1&t=C2zoLFkbUfarFl0d-1">link</a></p>
<p><img src="/images/paradigm/0.jpg" alt="Screen 0"></p>
<p>Above is the original screen — the product at its live state. Below are a few redesigns that I created. </p>
<p><img src="/images/paradigm/1.png" alt="Screen 1"></p>
<p><img src="/images/paradigm/2.png" alt="Screen 2"></p>
<p><img src="/images/paradigm/3.png" alt="Screen 3"></p>
<p><img src="/images/paradigm/4.png" alt="Screen 4"></p>
<p><img src="/images/paradigm/5.png" alt="Screen 5"></p>
<p><img src="/images/paradigm/6.png" alt="Screen 6"></p>
`,
    },
  },
  clique: {
    ...staticProjects.find((p) => p.slug === "clique")!,
    pageContent: {
      type: "static",
      html: `
<p><img src="/images/clique/website.png" alt="Clique"></p>

<h1 id="about-the-project">About the Project</h1>
<p>Clique is a social media app that I am currently working on with two other co-founders. Gone are the days of searching for that one picture from that one night — with Clique, you can organize and share your photos, by people, by moment.</p>
<h1 id="overview">Overview</h1>
<p>Below are a few key screens and interactions in the app. It&#39;s a bit difficult to completely document everything that I&#39;ve done, since it&#39;s just everything! Everything that you see, from the branding to the product, has been designed by me. I&#39;ve also worked on a good amount of the front-end, as I am the only design-oriented individual on the team. We&#39;re currently on TestFlight, but we hope to launch Fall 2025.</p>
<p><video src="/images/clique/feed-vid.mp4" alt="Clique"autoPlay
            loop
            muted
            playsInline
            preload="auto"></p>
<p><img src="/images/clique/screen-1.jpg" alt="Clique"></p>
<p><video src="/images/clique/collection-vid.mp4" alt="Clique"autoPlay
            loop
            muted
            playsInline
            preload="auto"></p>
<p><img src="/images/clique/screen-2.jpg" alt="Clique"></p>

`,
    },
  },
  speak: {
    ...staticProjects.find((p) => p.slug === "speak")!,
    pageContent: {
      type: "static",
      html: `
<p><img src="/images/speak/image.png" alt="image video"></p>
<h1 id="about-speak">About Speak</h1>
<p>I joined Speak — the AI-powered language-learning app backed by OpenAI, Khosla Ventures, and Buckley Ventures — as the company’s only designer at the time. Starting from a blank canvas, I built a cross-platform design system and integrated it into both engineering and product workflows. As the team grew from one to five designers, I defined, documented, and ran the design-ops process that underpinned every new feature. Along the way I shipped major UI pillars—including a full home-screen revamp, a re-imagined course view, an end-of-lesson experience, and new paywalls. After the summer, I continued as a part-time contractor, shifting towards a Design Engineering role where I built and shipped features using SwiftUI.</p>
<p><video src="/images/speak/home.mp4" alt="Home video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto">
            </p>
<h1 id="home-screen-redesign">Home-Screen Redesign</h1>
<p>As the daily landing place for hundreds of thousands of learners, the home screen needed to feel inviting yet purposeful. I led a complete overhaul that introduced a spacious card layout, contextual progress indicators, and a clearer visual hierarchy. The project served as the first real-world test of the new design system, while I carried out the formalized Design-to-Engineering handoff.</p>
<p><video src="/images/speak/course.mp4" alt="Course video"
autoPlay
            loop
            muted
            playsInline
            preload="auto"></p>
<h1 id="course-view-revamp">Course View Revamp</h1>
<p>Building on the new home experience, I re-imagined the course view so it could be reached with a single swipe. A deck-style carousel now previews upcoming lessons and animates open to reveal “Today you’ll learn …” teasers. Motion guides users without slowing them, and a reorganized information architecture ensures any course, unit, or lesson is no more than three taps away.</p>
<p><video src="/images/speak/unit.mp4" alt="Unit video" autoPlay
            loop
            muted
            playsInline
            preload="auto"></p>
<h1 id="unit-summaries-in-swiftui">Unit Summaries in SwiftUI</h1>
<p>Transitioning into a part-time Design Engineer role during my senior year, I shipped the Unit Summary feature — my first production work in SwiftUI. I built out the entire front-end, and connected it to the backend. Within a month, the feature was shipped!</p>
<p><img src="/images/speak/team.png" alt="Course video"></p>
<h1 id="reflections">Reflections</h1>
<p>These launches deepened my understanding of the friction points between design and engineering and showed how a living design system, paired with clear ops, keeps teams aligned. They also taught me how to contribute front-end code to a large production repo and how carefully timed motion can guide learners while celebrating their progress.</p>

`,
    },
  },
};

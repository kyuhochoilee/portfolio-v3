![Image 1](/images/thoughts/1.png)

# About the Project

I’ve always been a huge fan of journaling. However, when I started college, my life started getting extra busy and cluttered, and I found journaling to be a great way to gather my thoughts and reset at the end of each day. I tried a bunch of different ways of journaling; physical journals, different apps, but found that none of them quite worked for me. So, when my internship ended this past summer, I brought an idea of a journaling app to a friend and together, we created Thoughts.

# Project Overview

At its core, Thoughts is the anti-social media app. I chose a social media style for my UI, complete with a feed and post creation page, but the app intentionally has no online functionality — everything that users write within the app stays strictly on their phone. There is functionality for photo uploads, mood tracking, entry organization and search, and Spotify integration which allows you to pick a song of the week. Having never done mobile development, this project definitely required a ton of research and iteration.

![Image 2](/images/thoughts/2.png)

# The Problem

I never had the energy to actually write out my thoughts (and my handwriting is bad), so any time I tried to use a physical journal, it would fizzle out within a few days. I tried journaling apps, but I found them to be too formal and super clunky; I just didn’t want to use their apps. I did enjoy using private social media accounts, like Twitter and Instagram, because they were built for bite-sized content creation and I could create my own “aesthetic” within my feed. However, eventually I grew tired of how hard each account pushed me to try and consume content within the app; something I was not looking for in a journaling app. After years of experimenting with all of these different forms of journaling, I realized: why not make my own?

![Image 3](/images/thoughts/3.png)

# The Research

I carried out two main forms of research before beginning the app. The first was a simple survey which I sent out to friends and family. Through this survey, I uncovered a lot of interesting information that helped me get a good idea of what people were looking for. Unfortunately, my data set was not too large, due to various limitations, so the vast majority of people surveyed were students or young professionals. Above is the overview of the data. Next, I looked at current competitors in the market, and observed their UI, which I took inspiration from during the development of my wireframes.

![Image 4](/images/thoughts/4.png)

# The Solution

To align with all of these features and preferences, I developed a solution: a journal app in the form of social media. I loved the aspects of an Instagram and Twitter account where I could just open up the app spontaneously and just post whatever was on my mind. I also loved how I could curate my own feed to look and feel how I wanted it to. People also loved how these apps could add photos, and some had voice memos and music integration. Finally, journaling apps had great ways of organizing and searching through their entries. Thoughts had developed from a rough idea to the implementation of favorite features of journaling apps within a simple, accessible app.

![Image 5](/images/thoughts/5.png)

# Design

Based on the information that I gathered from my research, I went in and started wireframing, beginning with rough sketches and low fidelity prototypes, getting feeedback, and then creating a high fidelity prototype that was ready to be developed. At each stage, I seeked and gained valuable feedback from potential users, which helped me streamline my work.

![Image 6](/images/thoughts/6.png)

# Development

Once I had a final design, I went to my friend and together we started working on the actual app. We chose React Native, and used the Expo Go platform to test our app. I took charge of the front end of the app, making sure that all user-facing features were both functional and visually appealing. Meanwhile, my friend worked on the back end of the app, ensuring that it was working at top efficiency, while maintaining data security. Both of these processes had unprecedented challenges, since neither of us had worked with React Native before, which extended our estimated time of completion. However, we were able to successfully create a working prototype by the end of our month working on it, which I am pretty proud of.

![Image 7](/images/thoughts/7.png)

# Final Product

The app itself is fairly simple. There are three main screens - the first being the home, where all your journal entries are organized chronologically, similar to a social media feed. The header image at the top of your feed is randomized after a certain amount of time, and you have a button to log an entry, or what we call a “Thought”, straight from the get go. Each Thought is like a post, where you can see your title and first line of your post, top image, your mood, and your song, if you added one. If you click into the Thought, you can read the rest of the post, and edit or delete.

![Image 8](/images/thoughts/8.png)

# Create Screen

The create screen is also quite simple - it gets right to the point. You can enter any information in any of the fields. The mood picker and Spotify song selector was a key part of this design, as I wanted maximum personalization. By logging into your Spotify, we will suggest your most recently played songs, and then from there you can search a song that you would rather have. If you have Spotify open on your phone, you’re able to control it from Thoughts, and actually play the song if you’d like (this might only be available for Spotify Premium). We want to expand this to other music platforms too, but for now, since the majority of people I know use Spotify, we started with that. As an extra note, you just have to have one thing filled out for the thought to be logged. That way you can have the flexibility of using the journal for a variety of things. I wanted to implement the voice memos, but we ran into some technical issues, so hopefully that feature comes soon.

![Image 9](/images/thoughts/9.png)

# Profile Screen

The profile screen is where you can view your “profile”, as well as your posts in a more organized fashion. The profile, though not visible to anyone else, allows you to really make the app yours. You can add a profile picture, bio, just like a social media account. If you want to look back at old posts, we provided a calendar for you to find them quickly, and it indicates which dates have Thoughts. We also added a search function, and light and dark mode. And that’s pretty much it! As of right now, the app is fully functional and super fun to use.

![Image 10](/images/thoughts/10.png)

# Reflect

I absolutely loved making this app. It was super fun and interesting from the start to finish, and there were a ton of challenges and problems that I didn’t foresee, which pushed my skills as a designer and developer. I learned much more about how to use Figma effectively, React Native coding, and the design + engineering process from the start to finish. Being a personal project that I did with my best friend, it was really cool watching an idea turn into a real thing through our own hard work. With that being said, here were a few takeaways:

**Iterate, test, iterate, test, iterate!**

The UX testing aspect of this project was certainly the most educational. Getting opinions from non users gave me much more clarity in the direction that I wanted to take this app, and helped in formulating its present form. Having been one of the first mobile apps that I have designed, it was certainly a challenge, but getting feedback certainly helped a ton. And though it is something that is so stressed in design classes, it did feel different experiencing it first hand.

**The hardest part is the last 10%.**
As we closed in towards the end of development (or so we thought), we realized that the final details were the hardest to smooth over. As a team of two with limited resources, we found ourselves dedicating much more time than we expected to solving these final issues, and we ultimately ran out of time (we had to go back to school). Thus, if I were to do another personal project, I would reconsider the scope and time frame of it to make sure it is realistic and more achievable.

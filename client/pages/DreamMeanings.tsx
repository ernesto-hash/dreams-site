import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const sections = [
  {
    id: "flying",
    heading: "What Does It Mean to Dream About Flying",
    content: `Dreaming about flying is one of the most common and exhilarating dream experiences reported worldwide. When you dream of soaring through the sky, it often reflects a deep sense of freedom, ambition, or the desire to escape life's limitations. Many psychologists interpret flying dreams as a sign of confidence and the feeling of being in control of your own destiny. If you fly with ease, it may indicate that you feel empowered and capable of overcoming challenges. If you struggle to stay airborne, it might suggest anxiety about maintaining that sense of freedom or success in your waking life. Cultures around the world have long viewed flying dreams as spiritual messages — a connection to higher consciousness or divine guidance. Whether you glide peacefully over mountains or dart between city skyscrapers, your flying dream is a deeply personal symbol of your inner aspirations. Thousands of people across the globe have shared their flying dream experiences on Monument of Dreams, revealing incredible diversity in how this universal symbol manifests in our sleep.`,
  },
  {
    id: "water",
    heading: "What Does It Mean to Dream About Water",
    content: `Water is one of the most powerful and frequently recurring symbols in the world of dreams. Its meaning shifts dramatically depending on the state in which it appears: calm, clear water typically signals peace, clarity, and emotional balance, while turbulent, murky water can represent confusion, fear, or unresolved emotional conflicts. Oceans in dreams often speak to the vast unconscious mind — the deep well of emotions and memories that influence us below the surface of awareness. Rivers and streams tend to represent the flow of life, the passage of time, and the journey ahead. Floods can symbolise overwhelming emotions or situations that feel out of control. Rain in dreams frequently suggests renewal, cleansing, or the washing away of old burdens. Many spiritual traditions regard water as the element of intuition, transformation, and rebirth. Dream analysts often encourage people who frequently dream of water to pay close attention to their emotional state upon waking, as these dreams can be powerful mirrors of your inner emotional world. At Monument of Dreams, people from over 50 countries have submitted their water dreams, uncovering a rich tapestry of human emotion.`,
  },
  {
    id: "money",
    heading: "What Does It Mean to Dream About Money",
    content: `Money dreams are surprisingly common and can carry a wide range of meanings. Finding money in a dream — especially coins or banknotes — is widely interpreted as a positive omen, suggesting incoming opportunities, self-worth, or recognition of your value. Losing money, however, can reflect anxieties about financial security, fear of failure, or concerns about losing something important in your waking life. Stealing money in a dream may point to guilt, a feeling of taking something that is not deserved, or desires that conflict with your values. Giving money away can symbolise generosity, letting go of material attachment, or investing in relationships. Some dream researchers believe that money in dreams is rarely about literal finances — instead, it represents energy, power, potential, and what we believe we deserve in life. If money features prominently in your dreams, it may be worth reflecting on your relationship with abundance, self-esteem, and personal power. The Monument of Dreams community has shared fascinating stories about money dreams from every corner of the globe.`,
  },
  {
    id: "death",
    heading: "What Does It Mean to Dream About Death",
    content: `Despite being among the most unsettling dream themes, dreaming about death is rarely a literal prediction and is almost always symbolic. Death in dreams most commonly represents transformation, endings, and the beginning of something new. Just as death in nature makes way for new life, death dreams often signal that a chapter of your life is closing and something fresh is about to emerge. Dreaming of your own death can indicate a desire for change, a shedding of old identity, or a period of personal reinvention. Dreaming of someone else's death may reflect the changing nature of your relationship with that person, or the qualities that person represents in you. Grief, unresolved feelings, and fear of loss can also trigger death dreams, particularly during periods of significant life change. Many spiritual traditions view death dreams as messages of transformation and rebirth — an invitation to release what no longer serves you. Rather than fearing these dreams, many people find value in journalling them and exploring what they might represent about their current life circumstances.`,
  },
  {
    id: "love",
    heading: "What Does It Mean to Dream About Love",
    content: `Love dreams are among the most emotionally charged and memorable sleep experiences. They can leave you waking with a warm afterglow or a painful longing, depending on their content. Dreaming of falling in love with someone new may reflect a desire for deep connection, an exciting new chapter in life, or the discovery of new aspects of yourself. Dreams about a specific person — whether a current partner, an ex, or someone unreachable — often reveal your emotional needs, unresolved feelings, or the qualities you admire or desire in a relationship. Dreaming of romantic rejection can mirror fears of vulnerability or unworthiness, while dreaming of unconditional love often signals a need for self-acceptance and compassion. Love dreams can also be messages from the subconscious to pay attention to neglected relationships or to nurture the connections that matter most. At Monument of Dreams, thousands of people have bravely shared their love dreams — a testament to love's universal power to move us even in sleep.`,
  },
  {
    id: "falling",
    heading: "What Does It Mean to Dream About Falling",
    content: `The sensation of falling in a dream — and then jolting awake with your heart pounding — is one of the most universally experienced dream phenomena. Scientifically, this jolt is known as a hypnic jerk and occurs as the body transitions into sleep. But the symbolic meaning of falling dreams goes far deeper. Falling can represent a loss of control, anxiety about failure, or the feeling that something in your life is slipping away. It may reflect insecurity, self-doubt, or worry about not meeting expectations — your own or others'. Some dream analysts interpret falling as a signal to let go of perfectionism and trust the process of life. Others see it as the mind processing stress, particularly during periods of high pressure at work or in personal relationships. Interestingly, the direction and outcome of the fall matters: if you land safely, the dream may suggest resilience; if the fall feels endless, it may point to chronic anxiety. Exploring your falling dreams can be a powerful window into the areas of life where you feel most vulnerable.`,
  },
  {
    id: "teeth",
    heading: "What Does It Mean to Dream About Teeth Falling Out",
    content: `Teeth falling out is one of the most commonly reported and studied dream themes across all cultures and age groups. This dream frequently appears during times of stress, transition, or anxiety about appearance and how others perceive you. Teeth are deeply connected to confidence, communication, and the ability to face the world — so losing them in a dream often speaks to fears about losing those qualities. Many people report this dream during major life transitions: a new job, a breakup, a move, or any situation where they feel their self-image is under scrutiny. In some cultural traditions, dreaming of losing teeth is linked to concerns about health, family, or even omens about loved ones. Psychologically, it can reflect worry about saying the wrong thing, being misunderstood, or feeling powerless in communication. Some interpretations link teeth dreams to concerns about ageing or physical vitality. Whatever the personal trigger, teeth falling out dreams are almost always a signal worth heeding — an invitation to explore where you feel most exposed or uncertain in your waking life.`,
  },
  {
    id: "someone-you-love",
    heading: "What Does It Mean to Dream About Someone You Love",
    content: `Dreaming about someone you love — whether they are a partner, family member, close friend, or someone no longer in your life — is one of the most emotionally resonant dream experiences there is. These dreams can feel profoundly real and leave deep impressions upon waking. When you dream of someone you love who is alive and present in your life, it often reflects the depth of your connection, unspoken feelings, or current dynamics in the relationship that deserve attention. Dreams about deceased loved ones are particularly meaningful — many people describe these as visitation dreams, feeling as though the person is truly present with them. Grief researchers have noted that these dreams can be part of the natural healing process, offering comfort, unfinished conversations, or a sense of continued bond. Dreams about someone you love but have lost touch with may signal unresolved feelings, nostalgia, or a part of yourself associated with that person. At Monument of Dreams, many of the most moving submissions are dreams about the people who matter most — a reminder that love follows us even into sleep.`,
  },
];

export default function DreamMeanings() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title="Dream Meanings — What Do Your Dreams Mean? | Monument of Dreams"
        description="Explore the most common dream themes — flying, falling, water, love, death — and discover what they reveal about your inner world."
        canonical="https://monumentofdreams.com/dream-meanings"
      />
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-6">
            Dream Meanings — What Do Your Dreams Mean?
          </h1>
          <p className="text-neon-secondary text-lg max-w-2xl mx-auto">
            Explore the most common dream themes and discover what they might reveal about your inner world.
          </p>
        </div>

        <div className="space-y-16">
          {sections.map(section => (
            <article key={section.id} className="card-dark p-8 rounded-2xl">
              <h2 className="font-orbitron text-2xl font-bold text-neon-primary mb-6">
                {section.heading}
              </h2>
              <p className="text-neon-secondary leading-relaxed text-base">
                {section.content}
              </p>
              <div className="mt-8 pt-6 border-t border-neon-primary/20">
                <p className="text-neon-secondary/70 text-sm mb-3">
                  Have you experienced this type of dream? Share it with the world for just $1 and let thousands of people read it.
                </p>
                <Link
                  to="/submit"
                  className="neon-button inline-block px-6 py-2 text-sm"
                >
                  Share your dream about {section.id.replace(/-/g, " ")} — $1
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center card-dark p-8 rounded-2xl">
          <h2 className="font-orbitron text-2xl font-bold text-white mb-4">
            Your Dream Has Meaning
          </h2>
          <p className="text-neon-secondary mb-6 max-w-xl mx-auto">
            Join thousands of people worldwide who have preserved their dreams forever on Monument of Dreams. Every dream matters.
          </p>
          <Link to="/submit" className="neon-button px-8 py-3 text-base">
            Submit My Dream — Starting at $1
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

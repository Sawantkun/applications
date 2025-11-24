import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();
  const features = [
    {
      title: "Workflow automation",
      description:
        "Trigger personalized actions in Shopify when customers move through your funnel.",
    },
    {
      title: "Realtime insights",
      description:
        "Monitor product performance, inventory health, and campaign ROI live from one dashboard.",
    },
    {
      title: "Customer intelligence",
      description:
        "Segment buyers automatically and send them to the right Shopify audiences in seconds.",
    },
  ];
  const metrics = [
    { label: "Avg. hours saved weekly", value: "18" },
    { label: "Increase in repeat orders", value: "32%" },
    { label: "Automations deployed", value: "1.2K" },
  ];

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.logo}>BlackBytt</div>
        <div className={styles.actions}>
          <a href="mailto:hello@blackbytt.com">Talk to us</a>
          <button className={styles.ctaSecondary}>View demo</button>
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Shopify Plus ready</span>
          <h1>
            Launch automations that feel personal, convert faster, and scale
            with you.
          </h1>
          <p>
            BlackBytt unifies store data, surfaces the next best action, and
            turns it into workflows your team can deploy in minutes.
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.ctaPrimary}>Explore the platform</button>
            <button className={styles.ctaGhost}>See customer stories</button>
          </div>
        </div>

        {showForm && (
          <Form className={styles.loginCard} method="post" action="/auth/login">
            <p>Connect your Shopify store to get started.</p>
            <label className={styles.label}>
              <span>Shop domain</span>
              <input
                className={styles.input}
                type="text"
                name="shop"
                placeholder="your-shop.myshopify.com"
              />
            </label>
            <button className={styles.ctaPrimary} type="submit">
              Log in with Shopify
            </button>
            <span className={styles.helperText}>
              Secure OAuth. No credit card required.
            </span>
          </Form>
        )}
      </header>

      <section className={styles.metrics}>
        {metrics.map((metric) => (
          <article key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </section>

      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <p>Why teams switch to BlackBytt</p>
          <h2>Give revenue teams a control center for Shopify.</h2>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <article key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.testimonial}>
        <div>
          <p className={styles.badge}>Customer spotlight</p>
          <blockquote>
            “We replaced five disconnected apps with BlackBytt. Launching a new
            automation now takes minutes, not weeks.”
          </blockquote>
          <p className={styles.author}>
            Maya Ortiz — VP Operations, Lunar Labs
          </p>
        </div>
        <div className={styles.card}>
          <h4>What they shipped</h4>
          <ul>
            <li>Dynamic reorder nudges for top SKUs</li>
            <li>Automated low-inventory alerts in Slack</li>
            <li>VIP win-back journeys synced to email + SMS</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

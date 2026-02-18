const privacyPolicyUrl =
  process.env.APPLE_PRIVACY_POLICY_URL || 'https://steadydad.app/privacy';
const supportUrl = process.env.APPLE_SUPPORT_URL || 'https://steadydad.app/support';
const marketingUrl = process.env.APPLE_MARKETING_URL || 'https://steadydad.app';

module.exports = {
  configVersion: 0,
  apple: {
    categories: ['LIFESTYLE', 'HEALTH_AND_FITNESS'],
    info: {
      'en-US': {
        title: 'SteadyDad',
        subtitle: 'Baby tracker for dads',
        description:
          "SteadyDad helps first-time dads stay calm and organized during the newborn phase.\n\nTrack feeds, diapers, sleep, and mood in one tap. Follow practical, day-by-day guidance tailored to your baby's age. Save milestone moments with notes and photos.\n\nSteadyDad is designed for quick use with one hand, even in the middle of the night.\n\nCore features:\n• Fast event logging for feed, diaper, sleep, and mood\n• Timeline view to see what happened and when\n• Age-based tips focused on early fatherhood\n• Step-by-step helper checklists for common situations\n• Milestone tracking with photo memories\n• Local data export for backup\n\nSteadyDad is informational and not medical advice. Contact your pediatrician for medical concerns.",
        keywords: ['new dad,baby tracker,newborn,feed tracker,diaper tracker,sleep tracker,parenting'],
        privacyPolicyUrl,
        supportUrl,
        marketingUrl,
      },
    },
  },
};

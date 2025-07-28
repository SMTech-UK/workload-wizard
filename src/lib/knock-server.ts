import Knock from '@knocklabs/node';

// Check for server-side API key
const knockApiKey = process.env.KNOCK_API_KEY;
const knockClient = knockApiKey 
  ? new Knock({
      apiKey: knockApiKey,
    })
  : null;

// Log initialization status
if (!knockApiKey) {
  console.warn('⚠️  KNOCK_API_KEY not found in environment variables');
  console.warn('   This is required for server-side Knock operations (user identification, workflow triggers)');
  console.warn('   Get your server-side API key from: https://app.knock.app/settings/api-keys');
  console.warn('   Add it to your .env.local file as: KNOCK_API_KEY=sk_test_...');
}

/**
 * Identify or update a user in Knock
 * @param {string} userId - The unique user ID (e.g., Clerk user ID)
 * @param {object} userData - User data to send to Knock
 */
export async function identifyKnockUser(userId: string, userData: Record<string, any>) {
  if (!knockClient) {
    console.warn('Knock client not initialized - skipping user identification');
    console.warn('To fix this, add KNOCK_API_KEY=sk_test_... to your .env.local file');
    return;
  }
  try {
    await knockClient.users.update(userId, userData);
    console.log(`✅ Knock user identified: ${userId}`);
  } catch (err) {
    console.error('Knock identify error:', err);
  }
}

/**
 * Trigger a Knock workflow for a user
 * @param {string} workflowKey - The Knock workflow key
 * @param {string[]} recipients - Array of user IDs
 * @param {object} data - Data to pass to the workflow
 */
export async function triggerKnockWorkflow(workflowKey: string, recipients: string[], data: Record<string, any>) {
  if (!knockClient) {
    console.warn('Knock client not initialized - skipping workflow trigger');
    console.warn('To fix this, add KNOCK_API_KEY=sk_test_... to your .env.local file');
    return;
  }
  try {
    await knockClient.workflows.trigger(workflowKey, {
      recipients,
      data,
    });
    console.log(`✅ Knock workflow triggered: ${workflowKey} for ${recipients.length} recipients`);
  } catch (err) {
    console.error('Knock workflow trigger error:', err);
  }
} 
import { supabase } from './supabase';
import type { Session } from '../types/session';

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const sessionManager = {
  async createSession(deviceInfo: string): Promise<Session | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Use the safe_create_session function
      const { data, error } = await supabase
        .rpc('safe_create_session', {
          p_user_id: user.id,
          p_device_info: deviceInfo || navigator.userAgent,
          p_expires_in: '24 hours'
        });

      if (error) {
        console.error('Error creating session:', error);
        return null;
      }

      // Get the created session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', data)
        .single();

      if (sessionError) {
        console.error('Error retrieving created session:', sessionError);
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Error in createSession:', error);
      return null;
    }
  },

  async validateSession(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        await this.endSession();
        return false;
      }

      // Get active session
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error validating session:', error);
        return false;
      }

      if (!sessions || sessions.length === 0) {
        // No active session found, create a new one
        const newSession = await this.createSession(navigator.userAgent);
        return !!newSession;
      }

      // Update last activity
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', sessions[0].id);

      if (updateError) {
        console.error('Error updating session activity:', updateError);
      }

      return true;
    } catch (error) {
      console.error('Error in validateSession:', error);
      return false;
    }
  },

  async endSession(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Deactivate all active sessions for the user
      await supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error in endSession:', error);
    }
  },

  async refreshSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await this.endSession();
        return false;
      }

      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Error refreshing auth session:', refreshError);
        await this.endSession();
        return false;
      }

      return this.validateSession();
    } catch (error) {
      console.error('Error in refreshSession:', error);
      return false;
    }
  }
};
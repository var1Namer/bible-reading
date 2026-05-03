// db.js — Storage layer (Supabase)
//
// All data access goes through this module.
// To swap backends, only this file needs to change.

const SUPABASE_URL = 'https://nzwqnvhmjerdnixkuqob.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rUj0Z8u7b-UIKupMagq7og_Wzcwk6Bq0aKToHIZJYFX_xhJPYgbqfDVE0K6C8HuDfA';

const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth helpers
const Auth = {
  async signUp(email, password) {
    const { data, error } = await _sb.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },
  async signIn(email, password) {
    const { data, error } = await _sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut() {
    const { error } = await _sb.auth.signOut();
    if (error) throw error;
  },
  async getUser() {
    const { data: { user } } = await _sb.auth.getUser();
    return user;
  },
  onAuthChange(cb) {
    _sb.auth.onAuthStateChange((_event, session) => cb(session?.user || null));
  }
};

// Sessions CRUD
const DB = {
  async getSessions() {
    const { data, error } = await _sb
      .from('sessions')
      .select('id, passage, date, created_at, updated_at, data')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    // Normalize to same shape app.js expects
    return (data || []).map(r => ({
      id:        r.id,
      passage:   r.passage,
      date:      r.date,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      sections:  r.data?.sections || []
    }));
  },

  async getSession(id) {
    const { data, error } = await _sb
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return {
      id:        data.id,
      passage:   data.passage,
      date:      data.date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      sections:  data.data?.sections || []
    };
  },

  async saveSession(session) {
    const user = await Auth.getUser();
    const now  = Date.now();
    const row  = {
      id:         session.id,
      user_id:    user.id,
      passage:    session.passage || '',
      date:       session.date    || '',
      created_at: session.createdAt || now,
      updated_at: now,
      data:       { sections: session.sections }
    };
    const { error } = await _sb.from('sessions').upsert(row);
    if (error) throw error;
    session.updatedAt = now;
    return session;
  },

  async deleteSession(id) {
    const { error } = await _sb.from('sessions').delete().eq('id', id);
    if (error) throw error;
  }
};

import { supabase } from '../supabase';

export const incrementPageView = async (pageName: string) => {
  try {
    // We'll try to use a simple update with increment if possible, 
    // but the most reliable way in Supabase without a custom RPC 
    // is to fetch then update, or just use an RPC if the user has it.
    
    // Attempt to get current count
    const { data, error: selectError } = await supabase
      .from('site_stats')
      .select('value')
      .eq('name', `view_count_${pageName}`)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    const currentCount = data?.value ? parseInt(data.value) : 0;
    const newCount = currentCount + 1;

    const { error: upsertError } = await supabase
      .from('site_stats')
      .upsert({ 
        name: `view_count_${pageName}`, 
        value: newCount.toString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'name' });

    if (upsertError) throw upsertError;
    
    return newCount;
  } catch (error) {
    console.error('Error tracking page view:', error);
    return null;
  }
};

export const getPageViewCount = async (pageName: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('site_stats')
      .select('value')
      .eq('name', `view_count_${pageName}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return 0;
      throw error;
    }

    return data?.value ? parseInt(data.value) : 0;
  } catch (error) {
    console.error('Error fetching page view count:', error);
    return 0;
  }
};

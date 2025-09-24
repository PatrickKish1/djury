-- Create disputes table in Supabase
CREATE TABLE IF NOT EXISTS public.disputes (
    id BIGINT PRIMARY KEY,
    creator TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    opponent_addresses TEXT[],
    priority INTEGER DEFAULT 0,
    escrow_amount TEXT DEFAULT '0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0
);

-- Create comments table in Supabase
CREATE TABLE IF NOT EXISTS public.comments (
    id SERIAL PRIMARY KEY,
    dispute_id BIGINT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    section TEXT NOT NULL CHECK (section IN ('disputers', 'public')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (dispute_id) REFERENCES public.disputes(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_disputes_creator ON public.disputes(creator);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON public.disputes(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_dispute_id ON public.comments(dispute_id);
CREATE INDEX IF NOT EXISTS idx_comments_section ON public.comments(section);

-- Enable Row Level Security (RLS)
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for disputes table
CREATE POLICY "Anyone can read active disputes" ON public.disputes
    FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can create disputes" ON public.disputes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only creator can update their disputes" ON public.disputes
    FOR UPDATE USING (creator = auth.jwt() ->> 'sub');

CREATE POLICY "Only creator can delete their disputes" ON public.disputes
    FOR DELETE USING (creator = auth.jwt() ->> 'sub');

-- Create policies for comments table
CREATE POLICY "Anyone can read comments" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create comments" ON public.comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only author can update their comments" ON public.comments
    FOR UPDATE USING (author = auth.jwt() ->> 'sub');

CREATE POLICY "Only author can delete their comments" ON public.comments
    FOR DELETE USING (author = auth.jwt() ->> 'sub');

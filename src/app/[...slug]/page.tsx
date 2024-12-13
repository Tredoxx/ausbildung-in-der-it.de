import { notFound } from 'next/navigation';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import TableOfContents from '@/components/blocks/TableOfContents';
import { BaseBlock } from '@/components/blocks/types';

// Typen für die API-Daten
interface PageData {
    title: string;
    slug: string;
    breadcrumb: string[];
    content: {
        title: string;
        text: string;
        blocks: string;
        uuid: string;
    };
    children: string[];
}

async function getPageData(slugParts: string[]): Promise<PageData | null> {
    const path = slugParts.join('/');
    const res = await fetch(`http://localhost:8000/api/page?path=${path}`, {
        headers: {
            "Authorization": `Basic ${btoa("noel@lang-technology.de:test")}`,
        },
        // Optional: ISR/On-Demand Revalidation durch `revalidate`-Option ermöglichen
        next: { revalidate: 60 }
    });

    if (!res.ok) {
        return null;
    }

    return res.json();
}

// Statische Pfade generieren (Alle möglichen Routen aus Kirby holen)
export async function generateStaticParams() {
    const res = await fetch('http://localhost:8000/api/all-pages', {
        headers: {
            "Authorization": `Basic ${btoa("noel@lang-technology.de:test")}`,
        }
    });

    console.log(res);

    if (!res.ok) return [];

    const allPages: string[] = await res.json();

    return allPages.map(path => {
        const parts = path.split('/');
        return { slug: parts };
    });
}

export default async function Page({ params }: { params: { slug: string[] } }) {
    const data = await getPageData(params.slug);

    if (!data) {
        notFound();
    }

    // Parse the content string into blocks
    const blocks: BaseBlock[] = data.content.blocks ? JSON.parse(data.content.blocks) : [];

    return (
        <main className={"pt-16"}>
            <h1 className={"text-4xl font-bold tracking-tight"}>{data.content.title}</h1>
            <div className={"grid grid-cols-6 mt-3 gap-3"}>
                <div className="col-span-4 bg-white border rounded p-3">
                    <BlockRenderer blocks={blocks} />
                </div>
                <div className="col-span-2 space-y-3">
                    <div className="bg-white border rounded p-3">
                        <p>dsfdsafsadfdas nicht sticky</p>
                        <p>dsfdsafsadfdas nicht sticky</p>
                        <p>dsfdsafsadfdas nicht sticky</p>
                        <p>dsfdsafsadfdas nicht sticky</p>
                        <p>dsfdsafsadfdas nicht sticky</p>
                        <p>dsfdsafsadfdas nicht sticky</p>
                        <p>dsfdsafsadfdas nicht sticky</p>
                    </div>
                    <div className="bg-white border rounded p-3 sticky top-16">
                        <h2 className={"text-lg font-bold tracking-tight mb-2"}>Inhaltsverzeichnis</h2>
                        <TableOfContents blocks={blocks} />
                    </div>
                </div>
            </div>
        </main>
    );
}
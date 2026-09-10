import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUnifiedGalleryStories, GALLERY_CATEGORIES } from '@/lib/gallery';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const isAdmin = searchParams.get('admin') === 'true';

    // If admin is requesting, return database items directly along with summary counts
    if (isAdmin) {
      const dbItems = await prisma.galleryItem.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const totalCount = dbItems.length;
      const photoCount = dbItems.filter((i) => i.mediaType !== 'VIDEO').length;
      const videoCount = dbItems.filter((i) => i.mediaType === 'VIDEO').length;
      const featuredCount = dbItems.filter((i) => i.isFeatured).length;

      return NextResponse.json({
        success: true,
        items: dbItems,
        stats: {
          total: totalCount,
          photos: photoCount,
          videos: videoCount,
          featured: featuredCount,
        },
        categories: GALLERY_CATEGORIES,
      });
    }

    let stories = await getUnifiedGalleryStories();

    if (category && category !== 'all' && category !== 'ALL') {
      stories = stories.filter(
        (s) => s.categorySlug === category || s.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (limit && limit > 0) {
      stories = stories.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      count: stories.length,
      categories: GALLERY_CATEGORIES,
      stories,
      items: stories, // Provided for backwards/cross compatibility
    });
  } catch (error: any) {
    console.error('Failed to fetch gallery items:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'gallery')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, mediaUrl, mediaType = 'IMAGE', isFeatured = false, caption } = body;

    if (!title?.trim() || !mediaUrl?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title and Media URL / Image are required' },
        { status: 400 }
      );
    }

    const item = await prisma.galleryItem.create({
      data: {
        title: title.trim(),
        category: category?.trim() || 'Relief Seva',
        mediaUrl: mediaUrl.trim(),
        mediaType: mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        isFeatured: Boolean(isFeatured),
        caption: caption?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery item created successfully',
      item,
    });
  } catch (error: any) {
    console.error('Failed to create gallery item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'gallery')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, category, mediaUrl, mediaType, isFeatured, caption } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required for update' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (mediaUrl !== undefined) updateData.mediaUrl = mediaUrl.trim();
    if (mediaType !== undefined) updateData.mediaType = mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE';
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (caption !== undefined) updateData.caption = caption?.trim() || null;

    const item = await prisma.galleryItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery item updated successfully',
      item,
    });
  } catch (error: any) {
    console.error('Failed to update gallery item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update gallery item' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'gallery')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    await prisma.galleryItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully',
    });
  } catch (error: any) {
    console.error('Failed to delete gallery item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}

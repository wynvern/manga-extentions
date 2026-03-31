import {
    Chapter,
    ChapterDetails,
    ContentRating,
    Manga,
    MangaStatus,
    Source,
    SourceInfo
} from '@paperback/types'

export const MangafireInfo: SourceInfo = {
    version: '1.0.0',
    name: 'Mangafire',
    icon: 'mangafire_icon.png',
    author: 'wynvern',
    description: 'Mangafire manga source',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: 'https://mangafire.to'
}

export class Mangafire extends Source {

    readonly baseUrl = 'https://mangafire.to'

    async getMangaDetails(mangaId: string): Promise<Manga> {

        const request = App.createRequest({
            url: `${this.baseUrl}/manga/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        const title = $('h1').first().text().trim()
        const desc = $('.description').text().trim()
        const image = $('.poster img').attr('src') ?? ''

        return App.createManga({
            id: mangaId,
            titles: [title],
            image: image,
            desc: desc,
            status: MangaStatus.ONGOING
        })
    }


    async getChapters(mangaId: string): Promise<Chapter[]> {

        const request = App.createRequest({
            url: `${this.baseUrl}/manga/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        const chapters: Chapter[] = []

        $('.chapter-list a').each((index, element) => {

            const link = $(element).attr('href') ?? ''
            const name = $(element).text().trim()

            chapters.push(App.createChapter({
                id: link,
                mangaId: mangaId,
                name: name,
                chapNum: index,
                langCode: 'en'
            }))
        })

        return chapters
    }


    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {

        const request = App.createRequest({
            url: `${this.baseUrl}${chapterId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        const pages: string[] = []

        $('.reader img').each((_i, element) => {

            const img = $(element).attr('src') ?? ''
            if (img) pages.push(img)

        })

        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages
        })
    }
}

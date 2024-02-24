import { apiFetch } from "@codeday/topo/utils";
import { ThemeQuery } from './theme.gql';
import { OpenAIApi, Configuration } from "openai";
import getConfig from 'next/config';

export default async function getIdeas(req, res) {
    let theme = req.query.theme;
    if (!theme) {
      const result = await apiFetch(ThemeQuery, { endDate: (new Date(new Date().getTime())).toISOString() })
      theme = result.cms.events.items[0].theme
    }

    const config = getConfig();
    const configuration = new Configuration({
      apiKey: config.serverRuntimeConfig.OPENAI_KEY
    });
    const openai = new OpenAIApi(configuration);
  
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system',
          content: [
            'You are a helpful, creative, and fun assistant helping students brainstorm ideas at',
            'an event called CodeDay. CodeDay is a programming event inspiring students interested',
            'in art, music, or acting to create a game, app, interactive experience, or website.',
            'At CodeDay, we want students to make projects they personally are excited about, rather',
            'than something they think a teacher would find impressive. Students will tell you',
            'the theme for this event, and you will respond with exactly 5 ideas for projects.',
            'All of your ideas should be unique, creative, different, and fun.',
            'Do not include phrases like "create a", "program a", or "make a".',
            'Each idea should be on a new line and start with "> ". Include no additional formatting.',
            'Your ideas must be 10 words or less.',
            'Do not provide explanations.'
          ].join(' ')
        },
        {
          role: 'user',
          content: 'The theme for this CodeDay is "Time Warp"'
        },
        {
          role: 'assistant',
          content: [
            '> Platformer game where the level travels back in time',
            '> History based augmented reality experience',
            '> Chess with time travel',
            '> Time lapse garden simulator',
            '> Time-traveling detective mystery game'
          ].join('\n')
        },
        {
          role: 'user',
          content: 'The theme for this CodeDay is "Into The Unknown"'
        },
        {
          role: 'assistant',
          content: [
            '> Undersea exploration game',
            '> Space travel simulator',
            '> Parallel universe photo editor',
            '> Platformer game about an astronaut exploring a planet',
            '> Text adventure game about discovering a new species'
          ].join('\n')
        },
        {
          role: 'user',
          content: `The theme for this CodeDay is "${theme}"`
        }
      ],
      temperature: 0.85,
      max_tokens: 100,
    });
    const ideas = response.data.choices[0].message.content
      .split('\n')
      .map((s) => s.replace('>', '').trim())
    res.status(200).json({ideas})
}
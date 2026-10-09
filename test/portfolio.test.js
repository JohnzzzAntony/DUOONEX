const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const projects = require('../data/projects.json');
const approved = new Set(require('../data/public-media.json'));
const redirects = require('../data/project-redirects.json');

test('Portfolio cards, complete project details and screen links match the catalog', () => {
  for (const file of ['index.html', 'case-studies/index.html']) {
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    assert.deepEqual($('.work__card').map((_, el) => $(el).attr('href')).get(), projects.map(p => '/case-studies/' + p.slug + '/'));
    $('[data-filter]').each((_, el) => {
      const tag = $(el).attr('data-filter');
      const count = $('.work__card').filter((_, card) => tag === 'all' || $(card).attr('data-tags').split('|').includes(tag)).length;
      assert.equal(Number($(el).find('sup').text()), count);
    });
  }
  for (const project of projects) {
    const $ = cheerio.load(fs.readFileSync('case-studies/' + project.slug + '/index.html', 'utf8'));
    for (const field of ['overview', 'detail', 'journey', 'engineering', 'delivery', 'next']) assert.ok($('main').text().includes(project[field]), project.slug + ': ' + field);
    for (const feature of project.features) assert.ok($('main').text().includes(feature), feature);
    for (const file of project.media) assert.ok(approved.has('projects/' + file));
    const screenDir = 'assets/images/projects/screens/' + project.slug;
    const expected = fs.readdirSync(screenDir).filter(file => file.endsWith('.webp'));
    assert.equal($('.project-screens img').length, expected.length, project.slug);
    $('.project-screens img').each((_, el) => {
      const src = $(el).attr('src');
      assert.ok(fs.existsSync(path.join(process.cwd(), src)));
      assert.ok(approved.has(src.replace('/assets/images/', '')));
      assert.ok($(el).attr('alt'));
    });
  }
  for (const slug of ['kodezi','off-white','tournated','callai']) {
    assert.ok(!projects.some(p => p.slug === slug));
    assert.equal(redirects['/case-studies/' + slug + '/'], '/case-studies/');
  }
});

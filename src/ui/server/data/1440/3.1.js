module.exports = {
  commitTitle: 'DEVTOOLS-4599: Add option to add extra whitespace between projects',
  hash: 's324e8',
  commiter: 'woodcutter',
  time: '4 s ago',
  revision: 'r4318347',
  state: 'modified',
  path: '/trunk/arcadia/devtools/intellij/src/main/java/ru/yandex/devtools/intellij/arc/client/ArcCli.java',
  linesAdded: 100,
  linesRemoved: 81,
  locationStart: '@@ -270, 160',
  locationFinish: '+270, 161 @@',
  source: 
`package ru.yandex.devtools.intellij.arc.client;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.intellij.openapi.diagnostic.Logger;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vcs.FilePath;
import com.intellij.openapi.vcs.VcsException;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.vcsUtil.VcsUtil;
import org.jetbrains.annotations.NotNull;

import ru.yandex.devtools.intellij.arc.ArcContext;
import ru.yandex.devtools.intellij.arc.ArcRevisionNumber;
import ru.yandex.devtools.intellij.arc.ArcStatus;
import ru.yandex.devtools.intellij.arc.ui.ArcResetDialog;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
  * @author Dmitry Andreev <a href="mailto:AndreevDm@yandex-team.ru"></a>
  * @date 11/10/2018
*/
  public ArcCli(String arcBinaryPath) {
        this.arcBinaryPath = arcBinaryPath;
  }`
}